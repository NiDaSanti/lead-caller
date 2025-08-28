import fs from 'fs';
import path from 'path';

export const readDataFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const writeDataFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const backupLeadsFile = () => {
  const leadsPath = path.join(process.cwd(), 'server/data/leads.json');
  const backupDir = path.join(process.cwd(), 'server/data/backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const date = new Date().toISOString().split('T')[0];
  const backupPath = path.join(backupDir, `${date}-leads.json`);

  fs.copyFileSync(leadsPath, backupPath);
};
