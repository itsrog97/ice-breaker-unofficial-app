import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiError, session } from '@/api/client';
import { authApi } from '@/api/endpoints';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  /** Set when the session ended because the refresh token was rejected. */
  expiredNotice: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  dismissExpiredNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [expiredNotice, setExpiredNotice] = useState(false);

  // Restore a persisted session on launch.
  useEffect(() => {
    let cancelled = false;
    session
      .hydrate()
      .then((t) => !cancelled && setStatus(t ? 'signedIn' : 'signedOut'))
      .catch(() => !cancelled && setStatus('signedOut'));
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh token rejected → drop to login with a notice.
  useEffect(() => {
    const unsubscribe = session.onExpired(() => {
      queryClient.clear();
      setExpiredNotice(true);
      setStatus('signedOut');
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.signIn(email.trim(), password);
      if (!res.access_token || !res.refresh_token) {
        throw new ApiError(400, res.message || 'Sign in could not be completed.');
      }
      await session.set({ accessToken: res.access_token, refreshToken: res.refresh_token });
      queryClient.clear();
      setExpiredNotice(false);
      setStatus('signedIn');
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    // Best effort server-side sign out; local cleanup always happens.
    try {
      await authApi.signOut();
    } catch {
      /* ignore */
    }
    await session.clear();
    queryClient.clear();
    setStatus('signedOut');
  }, [queryClient]);

  const value = useMemo(
    () => ({ status, expiredNotice, signIn, signOut, dismissExpiredNotice: () => setExpiredNotice(false) }),
    [status, expiredNotice, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
