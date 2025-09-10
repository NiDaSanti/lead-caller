import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const leadsFile = process.env.LEADS_FILE
  ? path.resolve(process.env.LEADS_FILE)
  : path.join(__dirname, `../data/${env}/leads.json`);

const isRealResponse = (resp) =>
  typeof resp.q === 'string' &&
  typeof resp.a === 'string' &&
  resp.a.trim().length > 1 &&
  resp.a.toLowerCase() !== '300' &&
  resp.a.toLowerCase() !== 'yes' &&
  !resp.a.toLowerCase().includes('test');

try {
  const raw = fs.readFileSync(leadsFile, 'utf-8');
  const leads = JSON.parse(raw);

  const cleaned = leads.map((lead) => {
    const cleanedHistory = (lead.callHistory || [])
      .map((session) => {
        const validResponses = (session.responses || []).filter(isRealResponse);
        return validResponses.length > 0
          ? { ...session, responses: validResponses }
          : null;
      })
      .filter((s) => s !== null);

    return {
      ...lead,
      callHistory: cleanedHistory
    };
  });

  fs.writeFileSync(leadsFile, JSON.stringify(cleaned, null, 2));
  console.log(`✅ Cleaned call history and saved to leads.json`);
} catch (err) {
  console.error("❌ Failed to clean leads:", err);
}
