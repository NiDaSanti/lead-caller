import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point utilities to the test data directory before importing them
process.env.DATA_DIR = path.join(__dirname, '../data/dev');
const { readLeads, updateLeadById, findLeadByPhone } = await import('./leadUtils.js');
const leadsFile = path.join(process.env.DATA_DIR, 'leads.json');

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
