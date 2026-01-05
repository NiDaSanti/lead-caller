import fs from 'fs';
import path from 'path';
import { resolveLeadsFilePath } from './dataPaths.js';

export const readDataFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const writeDataFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const backupLeadsFile = () => {
  const leadsPath = resolveLeadsFilePath();
  // If LEADS_FILE points to a mounted disk, back up next to it.
  // Otherwise, fall back to the repo's default backups folder.
  const backupDir = process.env.LEADS_FILE
    ? path.join(path.dirname(leadsPath), 'backups')
    : path.join(process.cwd(), 'server/data/backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const date = new Date().toISOString().split('T')[0];
  const backupPath = path.join(backupDir, `${date}-leads.json`);

  fs.copyFileSync(leadsPath, backupPath);
};
