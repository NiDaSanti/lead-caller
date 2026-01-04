// Central auth/session helpers.
// Goal: avoid storing bearer tokens in localStorage (XSS-risk).
// We keep a lightweight in-memory auth flag and rely on HttpOnly auth cookies.
//
// NOTE: This file intentionally does not expose any token.

let authenticated = false;

export function isAuthenticated() {
  return authenticated;
}

export function setAuthenticated(value) {
  authenticated = !!value;
}

export async function login({ username, password, apiBase = '' }) {
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let message = 'Login failed.';
    try {
      const errData = await res.json();
      message = errData?.error || errData?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  authenticated = true;
  return res.json().catch(() => ({}));
}

export async function logout({ apiBase = '' } = {}) {
  try {
    await fetch(`${apiBase}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    authenticated = false;
  }
}

export async function getSession({ apiBase = '' } = {}) {
  const res = await fetch(`${apiBase}/api/auth/session`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) return { authenticated: false };
  const data = await res.json().catch(() => ({}));
  authenticated = !!data.authenticated;
  return data;
}
