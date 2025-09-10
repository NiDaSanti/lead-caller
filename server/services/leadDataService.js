import { readLeads, writeLeads } from '../utils/leadUtils.js';

export async function getLeadById(id = null, phone = null) {
  const leads = readLeads();

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
  const leads = readLeads();

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

  writeLeads(leads);
};

