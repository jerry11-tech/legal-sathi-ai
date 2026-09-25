const DEFAULT_BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const BACKEND_TIMEOUT_MS = 8000;

export function backendUrl(): string {
  return DEFAULT_BACKEND.replace(/\/$/, '');
}

export function proxyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${backendUrl()}${path}`, {
    ...init,
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}