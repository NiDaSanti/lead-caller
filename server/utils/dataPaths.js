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
