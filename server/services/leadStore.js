import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function defaultLeadsPath() {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  return path.join(__dirname, `../data/${env}/leads.json`);
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function leadIdKey(id) {
  // IDs in existing data may be numbers or strings (e.g., "test")
  return String(id);
}

export class LeadStore {
  constructor({ filePath, flushDelayMs = 400 } = {}) {
    this.filePath = filePath || (process.env.LEADS_FILE ? path.resolve(process.env.LEADS_FILE) : defaultLeadsPath());
    this.flushDelayMs = flushDelayMs;

    this._loaded = false;
    this._leads = [];
    this._byId = new Map();
    this._byPhone = new Map();

    this._pendingFlush = null;
    this._pendingFlushPromise = null;
    this._writing = false;
  }

  async init() {
    if (this._loaded) return;
    await this._loadFromDisk();
    this._loaded = true;
  }

  async _loadFromDisk() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      this._leads = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      // If file doesn't exist yet, start empty.
      if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
        this._leads = [];
      } else {
        throw err;
      }
    }

    this._rebuildIndexes();
  }

  _rebuildIndexes() {
    this._byId.clear();
    this._byPhone.clear();

    for (const lead of this._leads) {
      this._byId.set(leadIdKey(lead.id), lead);
      const p = normalizePhone(lead.phone);
      if (p) this._byPhone.set(p, lead);
    }
  }

  getAll() {
    return this._leads;
  }

  getById(id) {
    return this._byId.get(leadIdKey(id));
  }

  getByPhone(phone) {
    return this._byPhone.get(normalizePhone(phone));
  }

  hasPhone(phone) {
    return this._byPhone.has(normalizePhone(phone));
  }

  add(lead) {
    this._leads.push(lead);
    this._byId.set(leadIdKey(lead.id), lead);
    const p = normalizePhone(lead.phone);
    if (p) this._byPhone.set(p, lead);
    this._scheduleFlush();
    return lead;
  }

  updateById(id, updater) {
    const key = leadIdKey(id);
    const existing = this._byId.get(key);
    if (!existing) return null;

    const next = typeof updater === 'function' ? updater(existing) : { ...existing, ...(updater || {}) };

    // Update in array (preserve order)
    const idx = this._leads.findIndex((l) => leadIdKey(l.id) === key);
    if (idx !== -1) this._leads[idx] = next;

    this._byId.set(key, next);

    // Phone index may change
    const oldPhone = normalizePhone(existing.phone);
    const newPhone = normalizePhone(next.phone);
    if (oldPhone && oldPhone !== newPhone) this._byPhone.delete(oldPhone);
    if (newPhone) this._byPhone.set(newPhone, next);

    this._scheduleFlush();
    return next;
  }

  removeById(id) {
    const key = leadIdKey(id);
    const existing = this._byId.get(key);
    if (!existing) return null;

    this._byId.delete(key);
    const p = normalizePhone(existing.phone);
    if (p) this._byPhone.delete(p);

    const idx = this._leads.findIndex((l) => leadIdKey(l.id) === key);
    if (idx !== -1) this._leads.splice(idx, 1);

    this._scheduleFlush();
    return existing;
  }

  _scheduleFlush() {
    if (this._pendingFlush) {
      clearTimeout(this._pendingFlush);
      this._pendingFlush = null;
    }

    if (!this._pendingFlushPromise) {
      this._pendingFlushPromise = new Promise((resolve, reject) => {
        this._flushResolve = resolve;
        this._flushReject = reject;
      });
    }

    this._pendingFlush = setTimeout(() => {
      this._pendingFlush = null;
      this.flush().catch(() => {
        // errors are surfaced through awaited flush() calls
      });
    }, this.flushDelayMs);
  }

  async flush() {
    // If another flush is writing, wait for it.
    if (this._writing) {
      return this._pendingFlushPromise || Promise.resolve();
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    this._writing = true;
    try {
      const tmpPath = `${this.filePath}.tmp`;
      const payload = JSON.stringify(this._leads, null, 2);
      await fs.writeFile(tmpPath, payload, 'utf-8');
      await fs.rename(tmpPath, this.filePath);

      if (this._flushResolve) this._flushResolve();
    } catch (err) {
      if (this._flushReject) this._flushReject(err);
      throw err;
    } finally {
      this._writing = false;
      this._pendingFlushPromise = null;
      this._flushResolve = null;
      this._flushReject = null;
    }
  }
}

// Singleton store used by the API.
export const leadStore = new LeadStore({
  flushDelayMs: parseInt(process.env.LEADS_FLUSH_DELAY_MS || '400', 10),
});

export async function initLeadStore() {
  await leadStore.init();
  return leadStore;
}

export { normalizePhone };
