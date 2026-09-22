import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setAuthToken } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { getErrorMessage } from '../utils/errors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState(null);

  const applySession = useCallback((token, userData) => {
    setAuthToken(token);
    setUser(userData);
    setStatus('authenticated');
    connectSocket();
  }, []);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setStatus('unauthenticated');
    disconnectSocket();
  }, []);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await authApi.me();
      setUser(data.user);
      setStatus('authenticated');
      connectSocket();
    } catch {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    try {
      const { data } = await authApi.login({ email, password });
      applySession(data.token, data.user);
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, 'Invalid email or password.');
      setAuthError(message);
      return { ok: false, message };
    }
  }, [applySession]);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    try {
      const { data } = await authApi.register(payload);
      applySession(data.token, data.user);
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, 'Registration failed.');
      setAuthError(message);
      return { ok: false, message };
    }
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* cookie may already be cleared */
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      status,
      authError,
      login,
      register,
      logout,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
    }),
    [user, status, authError, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
