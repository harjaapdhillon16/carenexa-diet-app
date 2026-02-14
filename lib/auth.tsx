'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  role?: number;
  status?: number;
};

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const STORAGE_KEY = 'diet_app_user';

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setReady(true);
  }, []);

  const value = useMemo<AuthState>(() => {
    return {
      user,
      ready,
      login: (nextUser) => {
        setUser(nextUser);
        writeStoredUser(nextUser);
      },
      logout: () => {
        setUser(null);
        writeStoredUser(null);
      }
    };
  }, [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getStoredUser() {
  return readStoredUser();
}
