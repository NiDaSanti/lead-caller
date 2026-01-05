import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { resolveLeadsFilePath } from './dataPaths.js';
import { LeadStore } from '../services/leadStore.js';

test('resolveLeadsFilePath respects LEADS_FILE (absolute path)', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lead-caller-'));
  const file = path.join(tmpDir, 'leads.json');
  await fs.writeFile(file, JSON.stringify([{ id: 1, phone: '15551234567' }], null, 2), 'utf-8');

  const prev = process.env.LEADS_FILE;
  process.env.LEADS_FILE = file;
  try {
    assert.equal(resolveLeadsFilePath(), file);

    const store = new LeadStore({ flushDelayMs: 0 });
    await store.init();
    assert.equal(store.getAll().length, 1);
  } finally {
    if (prev == null) delete process.env.LEADS_FILE;
    else process.env.LEADS_FILE = prev;
  }
});
