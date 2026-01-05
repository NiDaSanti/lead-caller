import { getUsernameForToken, activeTokens } from '../middleware/tokenStore.js';

export function getAuthTokenFromRequest(req) {
  const cookieToken = req.cookies?.auth;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization || '';
  const headerToken = authHeader.split(' ')[1];
  return headerToken || null;
}

export function getAccountKey(req) {
  const token = getAuthTokenFromRequest(req);
  if (!token) return null;
  if (!activeTokens.has(token)) return null;

  const username = getUsernameForToken(token);
  // Default to 'default' so existing single-user deployments keep working.
  return username || 'default';
}
