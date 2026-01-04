import express from 'express';
import crypto from 'crypto';
import { generateToken, registerToken, unregisterToken } from '../middleware/auth.js';
import { getCookieOptions } from '../utils/cookies.js';

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

  // Backwards compatible response: token is still returned for older clients/tests,
  // but the recommended flow is HttpOnly cookie auth.
  res.json({ token, success: true });
});

router.post('/logout', (req, res) => {
  const cookieToken = req.cookies?.auth;
  if (cookieToken) unregisterToken(cookieToken);

  const authHeader = req.headers.authorization || '';
  const headerToken = authHeader.split(' ')[1];
  if (headerToken) unregisterToken(headerToken);

  res.clearCookie('auth', { path: '/' });
  res.json({ success: true });
});

router.get('/session', (req, res) => {
  const cookieToken = req.cookies?.auth;
  const authenticated = !!cookieToken;
  res.json({ authenticated });
});

export default router;
