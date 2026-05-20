// JWT token saqlash va auth-aware fetch (auto refresh).
// localStorage'da access + refresh token saqlanadi.

const ACCESS_KEY = 'soatly_access';
const REFRESH_KEY = 'soatly_refresh';
const USER_KEY = 'soatly_user';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

const isBrowser = () => typeof window !== 'undefined';

export const tokenStore = {
  getAccess: (): string | null =>
    isBrowser() ? localStorage.getItem(ACCESS_KEY) : null,
  getRefresh: (): string | null =>
    isBrowser() ? localStorage.getItem(REFRESH_KEY) : null,
  getUser: (): AuthUser | null => {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  set: (accessToken: string, refreshToken: string, user?: AuthUser) => {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Parallel 401 so'rovlar refresh'ni bir marta chaqirsin
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (apiBase: string): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const data = await res.json();
      if (data.accessToken && data.refreshToken) {
        tokenStore.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      tokenStore.clear();
      return false;
    } catch {
      tokenStore.clear();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export interface AuthFetchOptions extends RequestInit {
  auth?: boolean; // true bo'lsa Bearer header qo'shadi va 401 da refresh urinadi
  json?: unknown; // body'ni JSON sifatida yuborish — Content-Type avtomatik
}

/** AbortError'ni xavfsiz aniqlash (silenced fetch cancel uchun) */
export const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException && err.name === 'AbortError';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authFetch = async (
  path: string,
  opts: AuthFetchOptions = {},
): Promise<Response> => {
  const { auth, json, headers, body, ...rest } = opts;

  const buildHeaders = (): HeadersInit => {
    const h = new Headers(headers || {});
    if (auth) {
      const token = tokenStore.getAccess();
      if (token) h.set('Authorization', `Bearer ${token}`);
    }
    if (json !== undefined && !h.has('Content-Type')) {
      h.set('Content-Type', 'application/json');
    }
    return h;
  };

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: buildHeaders(),
      body: json !== undefined ? JSON.stringify(json) : (body as BodyInit | null | undefined),
      cache: 'no-store',
    });

  let res = await doFetch();

  // 401 va auth so'rov bo'lsa refresh urinish
  if (res.status === 401 && auth && tokenStore.getRefresh()) {
    const ok = await refreshAccessToken(API_BASE);
    if (ok) {
      res = await doFetch();
    }
  }

  return res;
};

// Json javob bilan ishlash uchun helper
export const apiJson = async <T = unknown>(
  path: string,
  opts: AuthFetchOptions = {},
): Promise<T> => {
  const res = await authFetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
};
