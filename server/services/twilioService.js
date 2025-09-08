import twilio from 'twilio';
import dotenv from 'dotenv';
import { saveLeadUpdate } from './leadDataService.js';

dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const twilioNumber = process.env.TWILIO_PHONE;
const serverBaseUrl = process.env.SERVER_BASE_URL;

const client = twilio(accountSid, authToken);

export const initiateCall = async (phoneNumber, leadId) => {
  console.log("📞 initiateCall →", phoneNumber, leadId);

  const voiceUrl = `${serverBaseUrl}/api/phone/voice?leadId=${encodeURIComponent(leadId)}`;
  const statusCallbackUrl = `${serverBaseUrl}/api/phone/status-callback`;

  const call = await client.calls.create({
    to: phoneNumber,
    from: twilioNumber,
    url: voiceUrl, // ✅ Send leadId here
    statusCallback: statusCallbackUrl,
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["completed"]
  });

  await saveLeadUpdate(leadId, {
    callInProgress: true,
    lastCallSid: call.sid
  });

  return call;
};
