import crypto from 'crypto';
import { activeTokens } from './tokenStore.js';

export const generateToken = () => crypto.randomBytes(48).toString('hex');
export const registerToken = (token) => activeTokens.add(token);
export const unregisterToken = (token) => activeTokens.delete(token);

// Backwards compatible auth:
// - preferred: HttpOnly cookie named `auth`
// - legacy: Authorization: Bearer <token>
export const requireAuth = (req, res, next) => {
  const cookieToken = req.cookies?.auth;
  if (cookieToken && activeTokens.has(cookieToken)) return next();

  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
