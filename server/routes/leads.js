import express from 'express';
import {
  getLeads,
  addLead,
  updateLead,
  getLeadById, // ← You need this
} from '../controllers/leadController.js';

const router = express.Router();

router.get('/', getLeads);
router.post('/', addLead);

// ✅ Add this route
router.get('/:id', getLeadById);

// ✅ Make sure this route already exists
router.put('/:id', updateLead);

export default router;
