import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserSession, UserRole } from '@/types/entities';
import { mockUserSessions } from '@/data/mockData';

interface AuthContextType {
  user: UserSession | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  const login = (role: UserRole) => {
    const session = mockUserSessions[role];
    if (session) {
      setUser(session);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
