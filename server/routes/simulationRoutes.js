import express from 'express';
import { simulateCall } from '../controllers/simulationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/call', requireAuth, simulateCall);

export default router;
