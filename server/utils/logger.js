import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'server/logs/actions.log');

export const logAction = (type, message) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${type}] ${message}\n`;
  try {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.appendFileSync(logFilePath, entry);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to write log entry', error);
  }
};
