import { activeTokens } from './tokenStore.js';

export const requireCookieAuth = (req, res, next) => {
  const token = req.cookies?.auth;
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
