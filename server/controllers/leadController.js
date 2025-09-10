import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDataFile, writeDataFile } from '../utils/fileHelpers.js';
import { logAction } from '../utils/logger.js';
import { summarizeLead } from '../services/openaiClients.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const leadsFile = process.env.LEADS_FILE
  ? path.resolve(process.env.LEADS_FILE)
  : path.join(__dirname, `../data/${env}/leads.json`);

  // server/controllers/leadController.js
  export const getLeads = (req, res) => {
    const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));
    res.json(leads); // should already include callHistory per lead
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
    const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));

    const normalizePhone = (p) => String(p).replace(/\D/g, '');
    const normalizedPhone = normalizePhone(phone);
    const exists = leads.some(l => normalizePhone(l.phone) === normalizedPhone);
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

    leads.push(newLead);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
    res.status(201).json({ success: true, lead: newLead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save new lead' });
  }
};


// PUT /api/leads/:id
export const updateLead = (req, res) => {
  try {
    const id = Number(req.params.id);
    const { id: _unusedId, note, tags, followUpDate, answers, ...rest } = req.body;
    const leads = readDataFile(leadsFile);
    const index = leads.findIndex(lead => lead.id === id);

    if (index === -1) return res.status(404).json({ error: 'Lead not found' });

    const existing = leads[index];

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

    leads[index] = updatedLead;
    writeDataFile(leadsFile, leads);

    res.status(200).json(updatedLead);
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};


export const softDeleteLead = (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const leads = readDataFile(leadsFile);
    const deletedPath = path.join(__dirname, '../data/deleted.json');
    const index = leads.findIndex(lead => lead.id === leadId);

    if (index === -1) return res.status(404).json({ error: 'Lead not found' });

    const [removedLead] = leads.splice(index, 1);

    // Archive the lead
    let archive = [];
    if (fs.existsSync(deletedPath)) {
      archive = JSON.parse(fs.readFileSync(deletedPath, 'utf-8'));
    }
    archive.push({ ...removedLead, deletedAt: new Date().toISOString() });
    fs.writeFileSync(deletedPath, JSON.stringify(archive, null, 2));

    // Update original file
    writeDataFile(leadsFile, leads);

    logAction('DELETE', `Lead ${removedLead.firstName} ${removedLead.lastName} archived.`);

    res.json({ success: true, lead: removedLead });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

export const getLeadById = (req, res) => {
  const { id } = req.params;
  const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));
  const lead = leads.find((l) => l.id == id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
};


export const getLeadSummary = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));
    const lead = leads.find(l => l.id === id);
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

