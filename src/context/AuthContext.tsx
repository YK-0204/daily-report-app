'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DEMO_USERS } from '@/types';
import { getFromStorage, setToStorage } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserId = getFromStorage<string | null>('currentUserId', null);
    if (savedUserId) {
      const foundUser = DEMO_USERS.find((u) => u.id === savedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string) => {
    const foundUser = DEMO_USERS.find((u) => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setToStorage('currentUserId', userId);
    }
  };

  const logout = () => {
    setUser(null);
    setToStorage('currentUserId', null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
