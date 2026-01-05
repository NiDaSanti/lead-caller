import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns the absolute path to the leads JSON file.
 *
 * Precedence:
 * 1) env.LEADS_FILE (absolute or relative)
 * 2) server/data/{dev|prod}/leads.json (repo default)
 */
export function resolveLeadsFilePath() {
  if (process.env.LEADS_FILE) {
    return path.resolve(process.env.LEADS_FILE);
  }

  const envFolder = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  // ../data is relative to /server/utils
  return path.join(__dirname, `../data/${envFolder}/leads.json`);
}

function safeKey(input) {
  return String(input || 'default')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'default';
}

/**
 * Returns the absolute path to the leads JSON file for a given account key.
 *
 * Precedence:
 * 1) env.LEADS_FILE (global override)
 * 2) env.DATA_DIR + env.LEADS_DIR (or DATA_DIR/leads) + <accountKey>.json
 * 3) legacy default: server/data/{dev|prod}/leads.json
 */
export function resolveLeadsFilePathForAccount(accountKey) {
  if (process.env.LEADS_FILE) {
    return path.resolve(process.env.LEADS_FILE);
  }

  const baseDir = process.env.LEADS_DIR
    ? path.resolve(process.env.LEADS_DIR)
    : (process.env.DATA_DIR ? path.join(path.resolve(process.env.DATA_DIR), 'leads') : null);

  if (baseDir) {
    return path.join(baseDir, `${safeKey(accountKey)}.json`);
  }

  return resolveLeadsFilePath();
}
