import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLeads, updateLeadById, findLeadByPhone } from './leadUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const leadsFile = path.join(__dirname, '../data/leads.json');

test('updateLeadById updates status and persists to file', () => {
  const originalData = fs.readFileSync(leadsFile, 'utf-8');
  const leads = JSON.parse(originalData);
  const [firstLead] = leads;
  try {
    const updatedLead = updateLeadById(firstLead.id, { status: 'Tested' });
    assert.strictEqual(updatedLead.status, 'Tested');

    const saved = readLeads().find(l => l.id === firstLead.id);
    assert.strictEqual(saved.status, 'Tested');
  } finally {
    fs.writeFileSync(leadsFile, originalData, 'utf-8');
  }
});

test('findLeadByPhone returns matching lead', () => {
  const lead = findLeadByPhone('+19199314345');
  assert.ok(lead);
  assert.strictEqual(lead.phone, '+19199314345');
});
