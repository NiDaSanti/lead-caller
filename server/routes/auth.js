import express from 'express';
import crypto from 'crypto';
import { generateToken, registerToken, unregisterToken } from '../middleware/auth.js';

const router = express.Router();

const hash = (str) => crypto.createHash('sha256').update(str).digest('hex');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const storedUser = process.env.ADMIN_USERNAME;
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !password || username !== storedUser || hash(password) !== storedHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken();
  registerToken(token);
  res.json({ token });
});

router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (token) unregisterToken(token);
  res.json({ success: true });
});

export default router;
