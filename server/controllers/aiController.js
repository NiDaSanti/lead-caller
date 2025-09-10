// server/controllers/aiController.js

import { getNextAIResponse } from '../services/openaiClients.js';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const leadsPath = process.env.LEADS_FILE
  ? path.resolve(process.env.LEADS_FILE)
  : path.join(process.cwd(), `server/data/${env}/leads.json`);

export const handleVoiceScript = async (req, res) => {
  const { leadId } = req.params;

  const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf-8'));
  const lead = leads.find(l => l.id === Number(leadId));

  if (!lead) {
    return res.status(404).send('<Response><Say>Sorry, we couldn’t find your file.</Say></Response>');
  }

  lead.callHistory = lead.callHistory || [];
  const previousMessages = lead.callHistory.map(entry => ({
    role: entry.role,
    content: entry.message
  }));

  const aiResponse = await getNextAIResponse(previousMessages);

  // Save it to call history
  lead.callHistory.push({ role: 'assistant', message: aiResponse });
  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));

  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Say>${aiResponse}</Say><Pause length="2"/><Redirect>/api/phone/voice-script/${leadId}</Redirect></Response>`);
};
