// Tiny fetch wrapper to ensure we always send cookies (HttpOnly session).
// Also centralizes API base (same-origin by default in prod).

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function getApiBase() {
  return DEFAULT_API_BASE;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http')
    ? path
    : `${DEFAULT_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
    },
  });
}
