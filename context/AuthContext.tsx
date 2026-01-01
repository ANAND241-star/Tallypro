
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/mockDatabase';

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
    const dbUser = await db.verifyCredentials(email, password);

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
    const userExists = await db.getUserByEmail(email);
    if (!userExists) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        password: password,
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString(),
        purchasedProducts: []
      };
      await db.addUser(newUser);
      setUser(newUser);
      localStorage.setItem('tallypro_session', JSON.stringify(newUser));
      return true;
    }
    return false;
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
