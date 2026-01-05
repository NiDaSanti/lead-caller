import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { getLeadStoreForAccount } from './leadStore.js';

test('LeadStore scoping: different accounts write to different files when DATA_DIR is set', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lead-caller-data-dir-'));

  const prevDataDir = process.env.DATA_DIR;
  process.env.DATA_DIR = tmpDir;

  try {
    const storeA = getLeadStoreForAccount('alice');
    const storeB = getLeadStoreForAccount('bob');
    await storeA.init();
    await storeB.init();

    storeA.add({ id: 1, phone: '15551230001' });
    storeB.add({ id: 2, phone: '15551230002' });
    await storeA.flush();
    await storeB.flush();

    // Reload stores from disk to ensure persistence paths are independent.
    const storeA2 = getLeadStoreForAccount('alice');
    const storeB2 = getLeadStoreForAccount('bob');
    await storeA2.init();
    await storeB2.init();

    assert.equal(storeA2.getAll().length, 1);
    assert.equal(storeB2.getAll().length, 1);
    assert.equal(storeA2.getAll()[0].phone, '15551230001');
    assert.equal(storeB2.getAll()[0].phone, '15551230002');
  } finally {
    if (prevDataDir == null) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = prevDataDir;
  }
});
