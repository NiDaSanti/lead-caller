import cron from 'node-cron';
import { readLeads, updateLeadById } from '../utils/leadUtils.js';
import { initiateCall } from './twilioService.js';

/**
 * Starts a cron job that checks for leads needing follow-up calls.
 * Runs every minute and initiates calls for overdue follow-ups.
 */
export function startScheduler() {
  // Run job every minute
  cron.schedule('* * * * *', async () => {
    const leads = readLeads();
    const now = new Date();

    for (const lead of leads) {
      if (!lead.followUpDate) continue;

      const followUpTime = new Date(lead.followUpDate);

      if (followUpTime <= now && !lead.callInProgress) {
        try {
          await initiateCall(lead.phone, lead.id);
          // Prevent repeated calls for the same follow-up
          updateLeadById(lead.id, { callInProgress: true, followUpDate: null });
        } catch (err) {
          console.error('Failed to initiate scheduled call:', err);
        }
      }
    }
  });
}

