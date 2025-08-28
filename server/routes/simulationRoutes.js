import express from 'express';
import { simulateCall } from '../controllers/simulationController.js';

const router = express.Router();

router.post('/call', simulateCall);

export default router;
