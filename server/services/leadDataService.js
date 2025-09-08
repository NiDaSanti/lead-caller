import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leadsFile = path.join(__dirname, '../data/leads.json');

export async function getLeadById(id = null, phone = null) {
  const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));

  if (id) {
    return leads.find(l => l.id === id || l.id === Number(id));
  }

  if (phone) {
    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    return leads.find(l => l.phone.replace(/\s+/g, '').trim() === normalizedPhone);
  }

  throw new Error('Lead not found');
}


export const saveLeadUpdate = async (leadId, updates) => {
  const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));

  const index = leads.findIndex(lead =>
    lead.id === leadId || lead.id === Number(leadId)
  );

  if (index === -1) {
    console.error("❌ saveLeadUpdate could not match leadId:", leadId);
    throw new Error('Lead not found');
  }

  leads[index] = {
    ...leads[index],
    ...updates
  };

  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
};

