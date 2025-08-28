import express from 'express';
import { messageLead } from '../controllers/actionsController.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/message-lead', rateLimiter, requireAuth, messageLead);

export default router;
