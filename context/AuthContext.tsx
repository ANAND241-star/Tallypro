
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { dbService as db } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, requiredRole?: 'admin' | 'customer') => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('anduriltech_session');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Admin accounts live only in env/memory — restore from localStorage directly
          if (parsedUser.id === 'admin_1' || parsedUser.id === 'admin_2') {
            setUser(parsedUser);
            return;
          }
          // For regular users — sync with DB
          const dbUser = await db.getUserByEmail(parsedUser.email);
          if (dbUser) setUser(dbUser);
        } catch (e) {
          console.error('Failed to restore session', e);
          localStorage.removeItem('anduriltech_session');
        }
      }
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    if (user) {
      const updatedUser = await db.getUserByEmail(user.email);
      if (updatedUser) {
        const { password: _, ...safeUser } = updatedUser as any;
        setUser(safeUser);
        localStorage.setItem('anduriltech_session', JSON.stringify(safeUser));
      }
    }
  };

  const login = async (email: string, password = '', requiredRole: 'admin' | 'customer' = 'customer') => {
    const dbUser = await db.login(email, password);

    if (requiredRole === 'admin') {
      if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super_admin')) {
        const { password: _, ...safeUser } = dbUser as any;
        setUser(safeUser);
        localStorage.setItem('anduriltech_session', JSON.stringify(safeUser));
        return true;
      }
      return false;
    }

    if (requiredRole === 'customer') {
      if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super_admin')) {
        console.warn('Admins must use admin portal');
        return false;
      }
      if (dbUser) {
        if (dbUser.status === 'inactive') return false;
        const { password: _, ...safeUser } = dbUser as any;
        setUser(safeUser);
        localStorage.setItem('anduriltech_session', JSON.stringify(safeUser));
        return true;
      }
      return false;
    }

    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const newUser: User = {
        id: '',
        name,
        email,
        // SECURITY: password NOT stored — Firebase Auth handles auth
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString(),
        purchasedProducts: []
      };
      const createdUser = await db.signup(newUser, password);
      const { password: _, ...safeCreatedUser } = createdUser as any;
      setUser(safeCreatedUser);
      localStorage.setItem('anduriltech_session', JSON.stringify(safeCreatedUser));
      return true;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return false;
      }
      // Re-throw other errors (weak password, network, etc) so UI can show them
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('anduriltech_session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'super_admin' || user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
