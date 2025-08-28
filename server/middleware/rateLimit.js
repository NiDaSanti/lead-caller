const rateLimitMap = new Map();

export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter(t => now - t < 60000); // 1 min
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (timestamps.length > 10) {
    return res.status(429).json({ error: 'Too many requests. Slow down.' });
  }

  next();
};
