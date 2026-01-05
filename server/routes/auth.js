import express from 'express';
import crypto from 'crypto';
import { generateToken, registerToken, unregisterToken } from '../middleware/auth.js';
import { activeTokens } from '../middleware/tokenStore.js';
import { getCookieOptions } from '../utils/cookies.js';
import { generateCsrfToken, getCsrfCookieOptions } from '../middleware/csrf.js';

const router = express.Router();

const hash = (str) => crypto.createHash('sha256').update(str).digest('hex');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const storedUser = process.env.ADMIN_USERNAME;
  const storedHash = process.env.ADMIN_PASSWORD
    ? hash(process.env.ADMIN_PASSWORD)
    : process.env.ADMIN_PASSWORD_HASH;

  if (!storedUser || !storedHash) {
    return res.status(500).json({
      error: 'Server auth is not configured (missing ADMIN_USERNAME and/or ADMIN_PASSWORD[_HASH]).'
    });
  }

  if (
    !username ||
    !password ||
    username !== storedUser ||
    hash(password) !== storedHash
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken();
  registerToken(token);

  const cookieOptions = getCookieOptions(req);
  res.cookie('auth', token, cookieOptions);

  // Issue CSRF token cookie for double-submit pattern.
  // Client should read this cookie and send it back via X-CSRF-Token header.
  res.cookie('csrf', generateCsrfToken(), getCsrfCookieOptions(req));

  // Backwards compatible response: token is still returned for older clients/tests,
  // but the recommended flow is HttpOnly cookie auth.
  res.json({ token, success: true });
});

// Fetch/refresh CSRF token.
// This is safe to call before any state-changing request.
router.get('/csrf', (req, res) => {
  const token = generateCsrfToken();
  res.cookie('csrf', token, getCsrfCookieOptions(req));
  res.json({ csrfToken: token });
});

router.post('/logout', (req, res) => {
  const cookieToken = req.cookies?.auth;
  if (cookieToken) unregisterToken(cookieToken);

  const authHeader = req.headers.authorization || '';
  const headerToken = authHeader.split(' ')[1];
  if (headerToken) unregisterToken(headerToken);

  // Clear cookies using the same options that were used to set them.
  // In particular, production cookies are SameSite=None; Secure, and browsers
  // may refuse to clear if those attributes don't match.
  const cookieOptions = getCookieOptions(req);
  res.clearCookie('auth', {
    path: cookieOptions.path || '/',
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
  const csrfOptions = getCsrfCookieOptions(req);
  res.clearCookie('csrf', {
    path: csrfOptions.path || '/',
    secure: csrfOptions.secure,
    sameSite: csrfOptions.sameSite,
  });
  res.json({ success: true });
});

router.get('/session', (req, res) => {
  const cookieToken = req.cookies?.auth;
  // Treat session as authenticated only if the token is both present and active.
  // This prevents stale cookies from re-authenticating the UI after logout.
  const authenticated = !!cookieToken && activeTokens.has(cookieToken);
  res.json({ authenticated });
});

export default router;
