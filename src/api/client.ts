import { API_BASE_URL, DEMO_MODE, REQUEST_TIMEOUT_MS } from '@/constants/config';
import { demoFetch } from '@/demo/demoFetch';
import { tokenStorage, type Tokens } from '@/services/tokenStorage';
import type { AuthResponse } from '@/types/api';

/**
 * Thin fetch wrapper for the Icebreaker REST API.
 *
 * - Sends `Authorization: Bearer <access_token>` (verified to be accepted by the API).
 * - On 401, performs a single-flight POST /auth/refresh and retries once.
 * - If refresh fails, clears the session and notifies the auth layer.
 * - Aborts requests after REQUEST_TIMEOUT_MS (matches the web client).
 */

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
  get isNetwork() {
    return this.status === 0;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
}

type Listener = () => void;

/** Network transport; the public web demo routes to an in-memory fake backend instead. */
function send(path: string, init: RequestInit): Promise<Response> {
  return DEMO_MODE ? demoFetch(path, init) : fetch(`${API_BASE_URL}${path}`, init);
}

let tokens: Tokens | null = null;
let refreshInFlight: Promise<boolean> | null = null;
const sessionExpiredListeners = new Set<Listener>();

export const session = {
  get tokens() {
    return tokens;
  },
  async hydrate(): Promise<Tokens | null> {
    tokens = await tokenStorage.load();
    return tokens;
  },
  async set(next: Tokens) {
    tokens = next;
    await tokenStorage.save(next);
  },
  async clear() {
    tokens = null;
    await tokenStorage.clear();
  },
  onExpired(fn: Listener) {
    sessionExpiredListeners.add(fn);
    return () => sessionExpiredListeners.delete(fn);
  },
};

function extractMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const d = (body as { detail: unknown }).detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d[0] && typeof d[0] === 'object' && 'msg' in d[0]) {
      return String((d[0] as { msg: unknown }).msg);
    }
  }
  if (status >= 500) return 'Icebreaker is having trouble right now. Please try again.';
  return `Request failed (${status})`;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function refreshTokens(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const current = tokens;
  if (!current) return false;
  refreshInFlight = (async () => {
    try {
      const res = await rawFetch('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as AuthResponse;
      await session.set({ accessToken: data.access_token, refreshToken: data.refresh_token });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function rawFetch(path: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const { timeoutMs = REQUEST_TIMEOUT_MS, headers, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const outer = rest.signal;
  if (outer) outer.addEventListener?.('abort', () => controller.abort());
  try {
    return await send(path, {
      ...rest,
      // Tokens travel in the Authorization header only; never rely on cookies.
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        ...(headers as Record<string, string> | undefined),
      },
      signal: controller.signal,
    });
  } catch (e) {
    if (controller.signal.aborted && !outer?.aborted) {
      throw new ApiError(0, 'The request timed out. Check your connection and try again.');
    }
    if (outer?.aborted) throw e;
    throw new ApiError(0, 'No connection. Check your internet and try again.');
  } finally {
    clearTimeout(timer);
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Skip the refresh-and-retry path (used by auth endpoints). */
  noAuthRetry?: boolean;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const init = {
    method: opts.method ?? 'GET',
    headers: opts.headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    timeoutMs: opts.timeoutMs,
    signal: opts.signal,
  };
  let res = await rawFetch(path, init);

  if (res.status === 401 && !opts.noAuthRetry && tokens) {
    const ok = await refreshTokens();
    if (ok) {
      res = await rawFetch(path, init);
    } else {
      await session.clear();
      sessionExpiredListeners.forEach((fn) => fn());
    }
  }

  const body = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(res.status, body), body);
  }
  return body as T;
}

/** Streaming POST (Server-Sent Events). Returns the raw Response so callers can read `body`. */
export async function streamPost(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const doFetch = () =>
    send(path, {
      method: 'POST',
      credentials: 'omit',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  let res = await doFetch();
  if (res.status === 401 && tokens && (await refreshTokens())) res = await doFetch();
  return res;
}

export const api = {
  get: <T>(path: string, o?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...o, method: 'GET' }),
  post: <T>(path: string, body?: unknown, o?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...o, method: 'POST', body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ?? {} }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
