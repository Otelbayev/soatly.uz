'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { tokenStore, AuthUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Token darrov mavjudligini tekshiradi (sync) */
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mount paytida saqlangan tokenni tekshirib, foydalanuvchini olamiz
    const stored = tokenStore.getUser();
    if (stored && tokenStore.getAccess()) {
      setUser(stored);
      // Backend'da haqiqatdan amal qiladi-yoqligini tekshiramiz
      authApi.me()
        .then((u) => setUser({ id: u.id, username: u.username, role: u.role }))
        .catch(() => {
          tokenStore.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const isAuthenticated = useCallback(() => !!tokenStore.getAccess(), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
