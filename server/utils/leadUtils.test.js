import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point utilities to the test data file before importing them
process.env.LEADS_FILE = path.join(__dirname, '../data/dev/leads.json');
const { readLeads, updateLeadById, findLeadByPhone } = await import('./leadUtils.js');
const leadsFile = process.env.LEADS_FILE;

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

test('updateLeadById returns null for unknown id', () => {
  const result = updateLeadById('non-existent-id', { status: 'Tested' });
  assert.strictEqual(result, null);
});

test('findLeadByPhone returns undefined for missing phone', () => {
  const result = findLeadByPhone('+10000000000');
  assert.strictEqual(result, undefined);
});
