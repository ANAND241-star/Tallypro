
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
      const savedUser = localStorage.getItem('tallypro_session');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Sync with DB asynchronously
          const dbUser = await db.getUserByEmail(parsedUser.email);
          if (dbUser) setUser(dbUser);
        } catch (e) {
          console.error("Failed to restore session", e);
        }
      }
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    if (user) {
      const updatedUser = await db.getUserByEmail(user.email);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('tallypro_session', JSON.stringify(updatedUser));
      }
    }
  };

  const login = async (email: string, password = '', requiredRole: 'admin' | 'customer' = 'customer') => {
    // 1. Verify Credentials via DB (Async)
    const dbUser = await db.login(email, password);

    // 2. Admin Login Flow
    if (requiredRole === 'admin') {
      if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super_admin')) {
        setUser(dbUser);
        localStorage.setItem('tallypro_session', JSON.stringify(dbUser));
        return true;
      }
      return false;
    }

    // 3. Customer Login Flow
    if (requiredRole === 'customer') {
      if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super_admin')) {
        console.warn("Admins must use admin portal");
        return false;
      }

      if (dbUser) {
        if (dbUser.status === 'inactive') return false;
        setUser(dbUser);
        localStorage.setItem('tallypro_session', JSON.stringify(dbUser));
        return true;
      }
      return false;
    }

    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const newUser: User = {
        // id will be set by firebase uid
        id: '',
        name: name,
        email: email,
        password: password, // Note: storing password in DB is bad practice, but keeping for compatibility with existing types. Firebase Auth handles real auth.
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString(),
        purchasedProducts: []
      };

      // Use signup method which handles auth creation + firestore doc
      const createdUser = await db.signup(newUser, password);
      setUser(createdUser);
      localStorage.setItem('tallypro_session', JSON.stringify(createdUser));
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
    localStorage.removeItem('tallypro_session');
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
