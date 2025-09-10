import twilio from 'twilio';
import dotenv from 'dotenv';
import { saveLeadUpdate } from './leadDataService.js';

dotenv.config();

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
};

const accountSid = requireEnv('TWILIO_SID');
const authToken = requireEnv('TWILIO_AUTH');
const serverBaseUrl = requireEnv('SERVER_BASE_URL');
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const twilioNumber = requireEnv(env === 'production' ? 'TWILIO_PHONE_PROD' : 'TWILIO_PHONE_DEV');

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
