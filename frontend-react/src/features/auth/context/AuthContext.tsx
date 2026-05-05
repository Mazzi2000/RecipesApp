import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useAuthQuery } from '@/features/auth/api/useAuth';
import type { User } from '@/lib/api/schemas';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useAuthQuery();
  const [loginOpen, setLoginOpen] = useState(false);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = data?.authenticated === true;
    const user = data?.authenticated === true ? data.user : null;
    return { isAuthenticated, isLoading, user, loginOpen, openLogin, closeLogin };
  }, [data, isLoading, loginOpen, openLogin, closeLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
