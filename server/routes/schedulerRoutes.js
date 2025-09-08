import express from 'express';
import { readSchedulerConfig, writeSchedulerConfig } from '../utils/schedulerUtils.js';

const router = express.Router();

router.get('/config', (req, res) => {
  const config = readSchedulerConfig();
  res.json(config);
});

router.put('/config', (req, res) => {
  const { startTime, stopTime, callsPerHour } = req.body;
  if (!startTime || !stopTime || typeof callsPerHour !== 'number') {
    return res.status(400).json({ error: 'Invalid config' });
  }
  if (startTime >= stopTime) {
    return res.status(400).json({ error: 'startTime must be before stopTime' });
  }
  if (callsPerHour <= 0) {
    return res.status(400).json({ error: 'callsPerHour must be greater than 0' });
  }
  const config = { startTime, stopTime, callsPerHour };
  writeSchedulerConfig(config);
  res.json(config);
});

export default router;
