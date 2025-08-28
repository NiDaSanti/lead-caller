import { logAction } from '../utils/logger.js';

export const messageLead = async (req, res) => {
  const { phone, history } = req.body;

  if (!phone || !Array.isArray(history)) {
    return res.status(400).json({ error: 'Missing phone or call history' });
  }

  // Simulated AI response
  const simulatedMessage = `Thanks for sharing your situation. Let's explore how solar can lower your monthly energy burden.`;

  // Log it for now
  logAction('SIMULATED_AI_SMS', `Would send to ${phone}: "${simulatedMessage}"`);

  res.status(200).json({
    success: true,
    message: simulatedMessage,
    note: '(Simulated AI + SMS - integrations not live yet)'
  });
};
