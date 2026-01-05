import crypto from 'crypto';

// Lightweight CSRF protection for cookie-based auth.
// Pattern: double-submit cookie
// - Server sets a non-HttpOnly cookie `csrf` (random token)
// - Client must echo the value in `X-CSRF-Token` header on state-changing requests
// - Token is bound to the browser via cookies; attacker sites can't read it.

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function getCsrfCookieOptions(req) {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false,
    secure: isProduction,
    // Must match auth cookie policy for cross-site requests (Netlify -> Render)
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

// Attach/refresh CSRF cookie if missing.
export function ensureCsrfCookie(req, res, next) {
  if (req.cookies?.csrf) return next();
  const token = generateCsrfToken();
  res.cookie('csrf', token, getCsrfCookieOptions(req));
  next();
}

// Require CSRF header match for state-changing methods.
export function requireCsrf(req, res, next) {
  const method = (req.method || '').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

  const cookieToken = req.cookies?.csrf;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }

  next();
}
