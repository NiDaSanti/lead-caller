import express from 'express';
import {
  startPhoneCall,
  continuePhoneCall,
  getVoiceScript,
  handleCallStatus, 
  receiveTranscript,
} from '../controllers/phoneController.js';

import { updateLeadById, readLeads } from '../utils/leadUtils.js';

const router = express.Router();

// 🔹 Route: Initiate call from frontend
router.post('/call', express.json(), startPhoneCall);

// 🔹 Route: Respond to Twilio 'Gather' action (keypress)
router.post('/continue', express.urlencoded({ extended: false }), continuePhoneCall);

// 🔹 Route: Twilio voice greeting and prompt (called when call starts)
router.all('/voice', getVoiceScript); // ✅ handles GET and POST

// 🔹 Route: Twilio status callback (not keypress)
router.post('/status-callback', express.urlencoded({ extended: false }), handleCallStatus);

// 🔹 Legacy or optional route: You can remove this if /status-callback works correctly
router.post('/status', express.urlencoded({ extended: false }), (req, res) => {
  const { CallSid, CallStatus } = req.body;

  if (CallStatus === 'completed') {
    const leads = readLeads();
    const lead = leads.find(l => l.lastCallSid === CallSid);

    if (lead) {
      updateLeadById(lead.id, { callInProgress: false });

      // Emit to frontend to close modal
      req.app.get('io')?.emit('call-ended', { to: lead.id });
    }
  }

  res.status(200).end();
});

// 🔹 Real-time transcript updates from Twilio (e.g. via webhook)
router.post(
  '/transcript',
  express.urlencoded({ extended: false }),
  async (req, res) => {
    const { SpeechResult } = req.body;
    const leadId = req.query.leadId || req.body.leadId || 'unknown';

    console.log(`📡 Transcript received for ${leadId}:`, SpeechResult);

    // Emit to client
    req.app.get('io')?.emit('transcript-update', {
      leadId,
      text: SpeechResult,
    });

    // Ensure controller receives the leadId regardless of source
    if (!req.body.leadId && req.query.leadId) {
      req.body.leadId = req.query.leadId;
    }

    await receiveTranscript(req, res);
  }
);


export default router;
