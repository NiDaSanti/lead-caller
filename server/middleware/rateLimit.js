const rateLimitMap = new Map();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const WINDOW_MS = 60 * 1000; // 1 minute

export const rateLimiter = (req, res, next) => {
  // Allow authenticated bulk uploads to bypass rate limiting
  if (req.originalUrl.includes('/bulk-upload') && req.headers.authorization) {
    return next();
  }

  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter(t => now - t < WINDOW_MS);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Slow down.' });
  }

  next();
};
