import twilio from 'twilio';
import { saveLeadUpdate } from './leadDataService.js';
// Environment variables are loaded once in `server/server.js`.

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const serverBaseUrl = process.env.SERVER_BASE_URL;
const twilioNumber = process.env[env === 'production' ? 'TWILIO_PHONE_PROD' : 'TWILIO_PHONE_DEV'];

// Only initialize Twilio if credentials exist.
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const initiateCall = async (phoneNumber, leadId) => {
  if (!client) {
    console.error('❌ Twilio client not initialized due to missing credentials.');
    throw new Error('Twilio client not initialized');
  }
  if (!twilioNumber || !serverBaseUrl) {
    console.error('❌ Missing Twilio configuration. Check phone number and SERVER_BASE_URL.');
    throw new Error('Missing Twilio configuration');
  }

  console.log('📞 initiateCall →', phoneNumber, leadId);

  const voiceUrl = `${serverBaseUrl}/api/phone/voice?leadId=${encodeURIComponent(leadId)}`;
  const statusCallbackUrl = `${serverBaseUrl}/api/phone/status-callback`;

  const call = await client.calls.create({
    to: phoneNumber,
    from: twilioNumber,
    url: voiceUrl, // ✅ Send leadId here
    statusCallback: statusCallbackUrl,
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['completed']
  });

  await saveLeadUpdate(leadId, {
    callInProgress: true,
    lastCallSid: call.sid
  });

  return call;
};
