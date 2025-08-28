import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'server/logs/actions.log');

export const logAction = (type, message) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${type}] ${message}\n`;
  fs.appendFileSync(logFilePath, entry);
};
