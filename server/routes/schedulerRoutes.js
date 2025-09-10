import express from 'express';
import { readSchedulerConfig, writeSchedulerConfig } from '../utils/schedulerUtils.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', requireAuth, (req, res) => {
  const config = readSchedulerConfig();
  res.json(config);
});

router.put('/config', requireAuth, (req, res) => {
  const { startTime, stopTime, callsPerHour, enabled, days } = req.body;
  if (!startTime || !stopTime || typeof callsPerHour !== 'number' || !Array.isArray(days)) {
    return res.status(400).json({ error: 'Invalid config' });
  }
  if (startTime >= stopTime) {
    return res.status(400).json({ error: 'startTime must be before stopTime' });
  }
  if (callsPerHour <= 0) {
    return res.status(400).json({ error: 'callsPerHour must be greater than 0' });
  }
  const config = { startTime, stopTime, callsPerHour, enabled: Boolean(enabled), days };
  writeSchedulerConfig(config);
  res.json(config);
});

export default router;
