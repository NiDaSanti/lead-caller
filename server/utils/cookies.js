export function getCookieOptions(req) {
  const isProduction = process.env.NODE_ENV === 'production';

  // If behind a TLS-terminating proxy (Render/Heroku/etc), Express needs to trust it
  // for secure cookies to work via X-Forwarded-Proto.
  const secure = isProduction;

  // Session TTL: you can adjust via env if you want longer/shorter sessions.
  // Default 7 days.
  const maxAgeMs = Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000);

  return {
    httpOnly: true,
    secure,
    // In production, the frontend is typically on a different origin (Netlify)
    // than the API (Render). Cross-site cookies require SameSite=None + Secure.
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeMs,
    // You can set `domain` if you need cross-subdomain cookies.
  };
}
