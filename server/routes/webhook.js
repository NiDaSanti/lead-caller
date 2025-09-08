import express from 'express';
import { addLead } from '../controllers/leadController.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { firstName, lastName, phone, address, note } = req.body;

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof phone !== 'string' ||
    typeof address !== 'object' ||
    typeof address.street !== 'string' ||
    typeof address.city !== 'string' ||
    typeof address.state !== 'string' ||
    typeof address.zip !== 'string' ||
    (note !== undefined && typeof note !== 'string')
  ) {
    return res.status(400).json({ error: 'Invalid lead payload' });
  }

  return addLead(req, res);
});

export default router;
