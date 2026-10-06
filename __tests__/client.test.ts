import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 0,
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    getItemAsync: jest.fn(async (k: string) => store[k] ?? null),
    deleteItemAsync: jest.fn(async (k: string) => {
      delete store[k];
    }),
  };
});

import { ApiError, api, session } from '@/api/client';

type Handler = (url: string, init: RequestInit) => { status: number; body?: unknown } | Promise<never>;

function mockFetch(handler: Handler) {
  const fn = jest.fn(async (url: string, init: RequestInit) => {
    const r = await handler(url, init);
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      text: async () => (r.body === undefined ? '' : JSON.stringify(r.body)),
      json: async () => r.body,
    } as unknown as Response;
  });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

const auth = (init: RequestInit) => (init.headers as Record<string, string>).Authorization;

describe('api client', () => {
  beforeEach(async () => {
    await session.set({ accessToken: 'A1', refreshToken: 'R1' });
  });

  it('sends the bearer token and parses JSON', async () => {
    const f = mockFetch(() => ({ status: 200, body: { ok: true } }));
    await expect(api.get('/api/v1/profile')).resolves.toEqual({ ok: true });
    expect(auth(f.mock.calls[0][1])).toBe('Bearer A1');
    expect(f.mock.calls[0][1].credentials).toBe('omit');
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const f = mockFetch((url, init) => {
      if (url.endsWith('/auth/refresh')) {
        expect(JSON.parse(init.body as string)).toEqual({ refresh_token: 'R1' });
        return { status: 200, body: { access_token: 'A2', refresh_token: 'R2', user: {} } };
      }
      return auth(init) === 'Bearer A2' ? { status: 200, body: { v: 1 } } : { status: 401, body: { detail: 'expired' } };
    });
    await expect(api.get('/api/v1/profile')).resolves.toEqual({ v: 1 });
    expect(session.tokens).toEqual({ accessToken: 'A2', refreshToken: 'R2' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ib_access_token', 'A2', expect.anything());
    expect(f.mock.calls.filter(([u]) => u.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('shares a single refresh between concurrent 401s', async () => {
    const f = mockFetch((url, init) => {
      if (url.endsWith('/auth/refresh')) return { status: 200, body: { access_token: 'A3', refresh_token: 'R3' } };
      return auth(init) === 'Bearer A3' ? { status: 200, body: {} } : { status: 401 };
    });
    await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);
    expect(f.mock.calls.filter(([u]) => u.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('clears the session and notifies when refresh fails', async () => {
    mockFetch((url) => (url.endsWith('/auth/refresh') ? { status: 401 } : { status: 401, body: { detail: 'Could not validate credentials' } }));
    const expired = jest.fn();
    const off = session.onExpired(expired);
    await expect(api.get('/api/v1/profile')).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalledTimes(1);
    expect(session.tokens).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    off();
  });

  it('surfaces API error details', async () => {
    mockFetch(() => ({ status: 422, body: { detail: [{ msg: 'Field required' }] } }));
    await expect(api.post('/x', {})).rejects.toMatchObject({ status: 422, message: 'Field required' });
  });

  it('maps 5xx to a friendly message', async () => {
    mockFetch(() => ({ status: 502 }));
    await expect(api.get('/x')).rejects.toMatchObject({ status: 502, message: expect.stringMatching(/trouble/) });
  });

  it('maps network failures to status 0', async () => {
    mockFetch(() => Promise.reject(new TypeError('Network request failed')));
    const err = (await api.get('/x').catch((e: ApiError) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.isNetwork).toBe(true);
  });

  it('times out slow requests', async () => {
    jest.useFakeTimers();
    globalThis.fetch = jest.fn(
      (_u: string, init: RequestInit) =>
        new Promise((_res, rej) => init.signal?.addEventListener('abort', () => rej(new Error('aborted')))),
    ) as unknown as typeof fetch;
    const p = api.get('/slow', { timeoutMs: 1000 }).catch((e: ApiError) => e);
    jest.advanceTimersByTime(1001);
    const err = (await p) as ApiError;
    jest.useRealTimers();
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toMatch(/timed out/);
  });

  it('does not attempt refresh for sign-in errors', async () => {
    const f = mockFetch(() => ({ status: 401, body: { detail: 'Invalid email or password' } }));
    const { authApi } = require('@/api/endpoints');
    await expect(authApi.signIn('a@b.co', 'x')).rejects.toMatchObject({ status: 401, message: 'Invalid email or password' });
    expect(f).toHaveBeenCalledTimes(1);
  });
});
