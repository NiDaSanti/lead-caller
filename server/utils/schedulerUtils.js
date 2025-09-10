import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const configFile = process.env.SCHEDULER_FILE
  ? path.resolve(process.env.SCHEDULER_FILE)
  : path.join(__dirname, `../data/${env}/scheduler.json`);

export function readSchedulerConfig() {
  if (!fs.existsSync(configFile)) {
    return { startTime: '09:00', stopTime: '17:00', callsPerHour: 60 };
  }
  const data = fs.readFileSync(configFile, 'utf-8');
  return JSON.parse(data);
}

export function writeSchedulerConfig(config) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}
