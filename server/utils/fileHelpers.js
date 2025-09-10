import fs from 'fs';
import path from 'path';

export const readDataFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const writeDataFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const backupLeadsFile = () => {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), `server/data/${env}`);
  const leadsPath = path.join(dataDir, 'leads.json');
  const backupDir = path.join(dataDir, 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const date = new Date().toISOString().split('T')[0];
  const backupPath = path.join(backupDir, `${date}-leads.json`);

  fs.copyFileSync(leadsPath, backupPath);
};
