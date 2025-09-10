import cron from 'node-cron';
import { readLeads, updateLeadById } from '../utils/leadUtils.js';
import { readSchedulerConfig } from '../utils/schedulerUtils.js';
import { initiateCall } from './twilioService.js';

/**
 * Starts a cron job that checks for leads needing follow-up calls.
 * Runs every minute and initiates calls for overdue follow-ups.
 */
let availableCalls = 0;

export function startScheduler() {
  // Run job every minute
  cron.schedule('* * * * *', async () => {
    const config = readSchedulerConfig();
    const { startTime, stopTime, callsPerHour, enabled, days } = config;
    const now = new Date();

    if (!enabled) return;
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = dayMap[now.getDay()];
    if (Array.isArray(days) && !days.includes(today)) return;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [stopHour, stopMinute] = stopTime.split(':').map(Number);
    const start = new Date(now);
    start.setHours(startHour, startMinute, 0, 0);
    const stop = new Date(now);
    stop.setHours(stopHour, stopMinute, 0, 0);

    if (now < start || now > stop) return;

    availableCalls += callsPerHour / 60;
    let callsRemaining = Math.floor(availableCalls);
    if (callsRemaining <= 0) return;

    const leads = readLeads();

    for (const lead of leads) {
      if (!lead.followUpDate) continue;

      const followUpTime = new Date(lead.followUpDate);

      if (followUpTime <= now && !lead.callInProgress && callsRemaining > 0) {
        try {
          await initiateCall(lead.phone, lead.id);
          updateLeadById(lead.id, { callInProgress: true, followUpDate: null });
          callsRemaining--;
          availableCalls--;
        } catch (err) {
          console.error('Failed to initiate scheduled call:', err);
        }
      }
    }
  });
}

