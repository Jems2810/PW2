import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../lib/catalog';

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

interface RegisterParams {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (params: LoginParams) => Promise<AuthUser>;
  register: (params: RegisterParams) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (next: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const clearStorage = () => {
  window.localStorage.removeItem(LOCAL_AUTH_KEY);
  window.sessionStorage.removeItem(SESSION_AUTH_KEY);
};

const readStoredUser = (): AuthUser | null => {
  const stored = window.localStorage.getItem(LOCAL_AUTH_KEY) || window.sessionStorage.getItem(SESSION_AUTH_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    clearStorage();
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isInitializing, setIsInitializing] = useState<boolean>(() => Boolean(readStoredUser()));

  const logout = () => {
    setUser(null);
    clearStorage();
    // Limpiar el carrito al cerrar sesión para no exponer datos del usuario anterior
    window.localStorage.removeItem('pw2_cart_state_v1');
    window.dispatchEvent(new Event('pw2-auth-logout'));
  };

  // Verifica contra el backend que el token sea válido y que el rol guardado
  // en localStorage no haya sido manipulado por el cliente (el servidor es la
  // única fuente de verdad).
  useEffect(() => {
    const stored = readStoredUser();
    if (!stored) {
      setIsInitializing(false);
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${stored.token}` }
        });

        if (!response.ok) {
          throw new Error('Sesión inválida');
        }

        const profile = await response.json();
        if (cancelled) return;

        const verified: AuthUser = {
          _id: profile._id,
          nombre: profile.nombre,
          email: profile.email,
          rol: profile.rol,
          token: stored.token
        };

        // Si el rol en storage no coincide con el del backend, se reescribe.
        if (profile.rol !== stored.rol) {
          const storeInLocal = Boolean(window.localStorage.getItem(LOCAL_AUTH_KEY));
          const targetStorage = storeInLocal ? window.localStorage : window.sessionStorage;
          const targetKey = storeInLocal ? LOCAL_AUTH_KEY : SESSION_AUTH_KEY;
          targetStorage.setItem(targetKey, JSON.stringify(verified));
        }

        setUser(verified);
      } catch {
        if (!cancelled) {
          clearStorage();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const register = async ({ nombre, email, password, telefono }: RegisterParams) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, telefono })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || 'No se pudo crear la cuenta');
    }

    const newUser = payload as AuthUser;
    window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newUser));
    window.sessionStorage.removeItem(SESSION_AUTH_KEY);
    setUser(newUser);
    return newUser;
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.rol === 'admin',
    isInitializing,
    login,
    register,
    logout,
    updateUser: (next: AuthUser) => {
      const storeInLocal = Boolean(window.localStorage.getItem(LOCAL_AUTH_KEY));
      if (storeInLocal) {
        window.localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(next));
      } else {
        window.sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(next));
      }
      setUser(next);
    }
  }), [user, isInitializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
