import express from 'express';
import {
  getLeads,
  addLead,
  updateLead,
  getLeadById, // ← You need this
} from '../controllers/leadController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getLeads);
router.post('/', requireAuth, addLead);

// ✅ Add this route
router.get('/:id', requireAuth, getLeadById);

// ✅ Make sure this route already exists
router.put('/:id', requireAuth, updateLead);

export default router;
