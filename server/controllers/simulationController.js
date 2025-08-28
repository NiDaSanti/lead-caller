// FILE: server/controllers/simulationController.js

import { askAI } from '../services/openaiClients.js';

/**
 * Simulate a solar call using a list of questions.
 * This is typically used for testing or training purposes.
 */
export const simulateCall = async (req, res) => {
  try {
    const { leadName, questions } = req.body;

    if (!leadName || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'leadName and questions array are required.' });
    }

    const responses = [];

    for (const question of questions) {
      const aiReply = await askAI([
        {
          role: 'system',
          content: `You're a solar consultant calling a homeowner to qualify them.
Speak casually and emotionally. Focus on power bills, energy rate spikes, and long-term cost anxiety.`
        },
        { role: 'user', content: question }
      ]);

      responses.push({ question, answer: aiReply });
    }

    res.status(200).json({ lead: leadName, responses });
  } catch (err) {
    console.error('❌ Simulation error:', err);
    res.status(500).json({ error: 'Failed to simulate call.' });
  }
};
