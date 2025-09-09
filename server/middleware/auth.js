import crypto from 'crypto';

const activeTokens = new Set();

export const generateToken = () => crypto.randomBytes(48).toString('hex');
export const registerToken = (token) => activeTokens.add(token);
export const unregisterToken = (token) => activeTokens.delete(token);

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
