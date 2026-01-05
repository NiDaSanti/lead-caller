// Tiny fetch wrapper to ensure we always send cookies (HttpOnly session).
// Also centralizes API base (same-origin by default in prod).

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfToken() {
  // Try cookie first
  const existing = readCookie('csrf');
  if (existing) return existing;

  // Ask server to issue one
  const res = await fetch(`${DEFAULT_API_BASE}/api/auth/csrf`, {
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data.csrfToken || readCookie('csrf');
}

export function getApiBase() {
  return DEFAULT_API_BASE;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http')
    ? path
    : `${DEFAULT_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const csrfToken = isStateChanging ? await ensureCsrfToken() : null;

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
  });
}
