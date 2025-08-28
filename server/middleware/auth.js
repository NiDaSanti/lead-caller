export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  const expected = process.env.ADMIN_TOKEN;

  if (!token || token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
