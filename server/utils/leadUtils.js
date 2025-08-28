import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const leadsFile = path.join(__dirname, '../data/leads.json');

export function readLeads() {
  const data = fs.readFileSync(leadsFile, 'utf-8');
  return JSON.parse(data);
}

export function writeLeads(leads) {
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
}

export function updateLeadById(id, updates = {}) {
  const leads = readLeads();
  const index = leads.findIndex(lead => lead.id === id);
  if (index === -1) return null;

  leads[index] = {
    ...leads[index],
    ...updates
  };

  writeLeads(leads);
  return leads[index];
}

export function findLeadByPhone(phone) {
  const leads = readLeads();
  return leads.find(lead => lead.phone === phone);
}
