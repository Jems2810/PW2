import React, { createContext, useContext, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api';
const LOCAL_AUTH_KEY = 'pw2_auth_session';
const SESSION_AUTH_KEY = 'pw2_auth_session_temp';

export interface AuthUser {
  _id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  token: string;
}

interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (params: LoginParams) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): AuthUser | null => {
  const stored = window.localStorage.getItem(LOCAL_AUTH_KEY) || window.sessionStorage.getItem(SESSION_AUTH_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    window.localStorage.removeItem(LOCAL_AUTH_KEY);
    window.sessionStorage.removeItem(SESSION_AUTH_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(LOCAL_AUTH_KEY);
    window.sessionStorage.removeItem(SESSION_AUTH_KEY);
  };

  const login = async ({ email, password, rememberMe }: LoginParams) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || 'No se pudo iniciar sesión');
    }

    const authenticatedUser = payload as AuthUser;

    if (rememberMe) {
      window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authenticatedUser));
      window.sessionStorage.removeItem(SESSION_AUTH_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(authenticatedUser));
      window.localStorage.removeItem(LOCAL_AUTH_KEY);
    }

    setUser(authenticatedUser);

    return authenticatedUser;
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.rol === 'admin',
    login,
    logout
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};