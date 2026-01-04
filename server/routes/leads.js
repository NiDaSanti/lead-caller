import express from 'express';
import {
  getLeads,
  addLead,
  addLeadsBulk,
  updateLead,
  getLeadById, // ← You need this
  getLeadSummary,
  softDeleteLead,
} from '../controllers/leadController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getLeads);
router.post('/', requireAuth, addLead);
// Bulk add
router.post('/bulk', requireAuth, addLeadsBulk);

router.get('/:id/summary', requireAuth, getLeadSummary);

// ✅ Add this route
router.get('/:id', requireAuth, getLeadById);

// ✅ Make sure this route already exists
router.put('/:id', requireAuth, updateLead);

router.delete('/:id', requireAuth, softDeleteLead);

export default router;
