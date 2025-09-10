import crypto from 'crypto';

// Map of token -> last activity timestamp
const activeTokens = new Map();

// Read timeout from environment (defaults to 30 minutes)
const getIdleTimeout = () =>
  parseInt(process.env.TOKEN_IDLE_TIMEOUT_MS || '', 10) || 30 * 60 * 1000;

export const generateToken = () => crypto.randomBytes(48).toString('hex');
export const registerToken = (token) => activeTokens.set(token, Date.now());
export const unregisterToken = (token) => activeTokens.delete(token);

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  const lastActive = activeTokens.get(token);

  if (!token || lastActive === undefined) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idleTimeout = getIdleTimeout();
  if (Date.now() - lastActive > idleTimeout) {
    activeTokens.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  // refresh last activity timestamp
  activeTokens.set(token, Date.now());
  next();
};
