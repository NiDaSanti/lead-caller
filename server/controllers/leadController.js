import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logAction } from '../utils/logger.js';
import { summarizeLead } from '../services/openaiClients.js';
import { leadStore, normalizePhone } from '../services/leadStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/controllers/leadController.js
export const getLeads = (req, res) => {
  // LeadStore is warmed at startup. This is an in-memory read.
  res.json(leadStore.getAll());
};


export const addLead = (req, res) => {
  const { firstName, lastName, phone, address, note = "" } = req.body;

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !address ||
    !address.street ||
    !address.city ||
    !address.state ||
    !address.zip
  ) {
    return res.status(400).json({ error: 'Missing required lead or address fields' });
  }

  try {
    const normalizedPhone = normalizePhone(phone);
    const exists = leadStore.hasPhone(normalizedPhone);
    if (exists) {
      return res.status(409).json({ error: 'Phone already exists' });
    }

    const newLead = {
      id: Date.now(),
      firstName,
      lastName,
      phone: normalizedPhone,
      address,
      note,
      status: "New",
      tags: [],
      callHistory: [],
      createdAt: new Date().toISOString()
    };

    leadStore.add(newLead);
    res.status(201).json({ success: true, lead: newLead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save new lead' });
  }
};

// POST /api/leads/bulk
export const addLeadsBulk = (req, res) => {
  try {
    const items = Array.isArray(req.body.leads) ? req.body.leads : req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Request must be an array of leads' });

    const normalizePhoneLocal = (p) => String(p || '').replace(/\D/g, '');

    let inserted = 0;
    let duplicates = 0;
    let errors = 0;
    const added = [];

    for (const row of items) {
      try {
        const firstName = row.firstName;
        const lastName = row.lastName;
        const phone = row.phone;
        const address = row.address || {};

        if (!firstName || !lastName || !phone || !address.street || !address.city || !address.state || !address.zip) {
          errors += 1;
          continue;
        }

        const normalizedPhone = normalizePhoneLocal(phone);
        const exists = leadStore.hasPhone(normalizedPhone);
        if (exists) {
          duplicates += 1;
          continue;
        }

        const newLead = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          firstName,
          lastName,
          phone: normalizedPhone,
          address,
          note: row.note || row.notes || '',
          status: 'New',
          tags: row.tags || [],
          callHistory: [],
          createdAt: new Date().toISOString(),
        };

        leadStore.add(newLead);
        added.push(newLead);
        inserted += 1;
      } catch (err) {
        errors += 1;
      }
    }

    res.status(201).json({ success: true, inserted, duplicates, errors, leads: added });
  } catch (err) {
    console.error('Bulk add error:', err);
    res.status(500).json({ error: 'Failed to add leads in bulk' });
  }
};


// PUT /api/leads/:id
export const updateLead = (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _unusedId, note, tags, followUpDate, answers, ...rest } = req.body;

    const existing = leadStore.getById(id);
    if (!existing) return res.status(404).json({ error: 'Lead not found' });

    const filteredAnswers = (answers || []).filter(resp =>
      typeof resp.q === 'string' &&
      typeof resp.a === 'string' &&
      resp.a.trim().length > 1 &&
      !['300', 'yes'].includes(resp.a.toLowerCase()) &&
      !resp.a.toLowerCase().includes('test')
    );

    const session = filteredAnswers.length
      ? { timestamp: new Date().toISOString(), responses: filteredAnswers }
      : null;

    // 🧠 Generate analytics
    const now = new Date().toISOString();
    const newCallHistory = session ? [...existing.callHistory, session] : existing.callHistory;
    const totalCalls = newCallHistory.length;
    const totalReplies = newCallHistory.reduce((sum, entry) => sum + (entry.responses?.length || 0), 0);
    const lastResponseTime = newCallHistory[newCallHistory.length - 1]?.timestamp || existing.lastContacted || now;

    const updatedLead = {
      ...existing,
      ...rest,
      note: note ?? existing.note,
      tags: tags ?? existing.tags,
      followUpDate: followUpDate ?? existing.followUpDate,
      callHistory: newCallHistory,
      lastContacted: lastResponseTime,
      totalCalls,
      totalReplies
    };

    leadStore.updateById(id, updatedLead);

    res.status(200).json(updatedLead);
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};


export const softDeleteLead = (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const deletedPath = path.join(__dirname, '../data/deleted.json');

    const removedLead = leadStore.removeById(leadId);
    if (!removedLead) return res.status(404).json({ error: 'Lead not found' });

    // Archive the lead
    let archive = [];
    if (fs.existsSync(deletedPath)) {
      archive = JSON.parse(fs.readFileSync(deletedPath, 'utf-8'));
    }
    archive.push({ ...removedLead, deletedAt: new Date().toISOString() });
    fs.writeFileSync(deletedPath, JSON.stringify(archive, null, 2));

    logAction('DELETE', `Lead ${removedLead.firstName} ${removedLead.lastName} archived.`);

    res.json({ success: true, lead: removedLead });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

export const getLeadById = (req, res) => {
  const { id } = req.params;
  const lead = leadStore.getById(id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
};


export const getLeadSummary = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const lead = leadStore.getById(id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const summary = await summarizeLead(lead);
    res.json({ summary });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

