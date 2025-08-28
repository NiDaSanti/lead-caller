import { askAI } from '../services/openaiClients.js';
import { getLeadById, saveLeadUpdate } from '../services/leadDataService.js';
import { initiateCall } from '../services/twilioService.js';
import twilio from 'twilio';
// ✅ ADD THIS if missing
export const startPhoneCall = async (req, res) => {
  const { phoneNumber, leadId } = req.body;

  if (!phoneNumber || !leadId) {
    return res.status(400).json({ error: 'Phone number and lead ID are required.' });
  }

  try {
    const call = await initiateCall(phoneNumber, leadId);
    res.status(200).json({ message: 'Call initiated', sid: call.sid });
  } catch (error) {
    console.error('❌ Twilio call error:', error);
    res.status(500).json({ error: 'Failed to initiate call.' });
  }
};


export const continuePhoneCall = async (req, res) => {
  console.log('Recording Received: ', req.body)
  const { TranscriptionText: transcription, RecordingUrl: recordingUrl } = req.body;
  const { leadId } = req.query;

  console.log("📞 /continue called");
  console.log("Lead ID:", leadId);
  console.log("Transcription:", transcription || "⏳ Not received yet");
  console.log("Recording URL:", recordingUrl);

  // Early exit if only recording webhook (no transcription yet)
  if (!transcription) {
    return res.status(200).type('text/xml').send('<Response></Response>');
  }

  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    console.error("❌ Lead not found:", leadId);
    return res.status(404).send("Lead not found");
  }

  try {
    const{ aiReply } = await askAI([
      {
        role: 'system',
        content: `You're a solar represenative qualifying a homeowner. Speak casually and emotionally.`
      },
      {
        role: 'user',
        content: transcription
      }
    ])

    // Save response to call history
    const updatedHistory = [
      ...(lead.callHistory || []),
      {
        user: transcription,
        ai: aiReply,
        timestamp: new Date().toISOString(),
      },
    ];

    updateLeadById(lead.id, { callHistory: updatedHistory });

    // Build TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Matthew', language: 'en-US' }, aiReply);
    twiml.redirect(`/api/phone/voice?leadId=${lead.id}`);

    return res.type('text/xml').send(twiml.toString());
  } catch (err) {
    console.error("⚠️ Error during AI call handling:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const handleCallStatus = async (req, res) => {
  const { CallSid, CallStatus, To } = req.body || {};
  const io = req.app.get('io');

  if (!CallSid || !CallStatus) {
    return res.status(400).json({ error: "Invalid callback payload." });
  }

  try {
    const lead = await getLeadById(null, To);
    if (lead) {
      lead.callInProgress = false;
      lead.lastContacted = new Date().toISOString(); // ✅ track last contact
      await saveLeadUpdate(lead.id, lead);
    }
  } catch (e) {
    console.error("⚠️ Failed to update callInProgress:", e);
  }

  if (['completed', 'no-answer', 'busy', 'failed'].includes(CallStatus)) {
    io.emit('call-ended', { to: To });
  }

  res.status(200).end();
};


// 🔹 Initial voice prompt with speech capture
export const getVoiceScript = (req, res) => {
  const { leadId = 'unknown' } = req.query;
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Ask question
  twiml.say(
    {
      voice: 'Polly.Matthew',
      language: 'en-US'
    },
    `Hey there. What’s your average electric bill? Just say it after the beep.`
  );

  // Record caller
  twiml.record({
    action: `/api/phone/continue?leadId=${leadId}`,
    method: 'POST',
    maxLength: 30,
    timeout: 5,
    transcribe: true,
    transcribeCallback: `/api/phone/continue?leadId=${leadId}`,
    recordingStatusCallback: `/api/phone/status-callback`,
    playBeep: true,
    trim: 'trim-silence',
  });

  // Fallback if nothing captured
  twiml.say("Sorry we didn’t catch that. We'll follow up later.");
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
};


// 🔹 New: Receive and store real-time transcript
export const receiveTranscript = (req, res) => {
  const { SpeechResult, leadId } = req.body;
  const timestamp = new Date().toISOString();

  console.log(`📝 Transcript received for ${leadId}:`, SpeechResult);

  if (leadId && SpeechResult) {
    // Append transcript to callHistory (mock implementation — adapt as needed)
    const leads = readLeads();
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      lead.callHistory = lead.callHistory || [];
      lead.callHistory.push({
        user: SpeechResult,
        ai: "⏳ AI is processing...",  // You can replace this with real AI response logic
        timestamp
      });
      // I just added this here.
      // got back to rework.
      lead.callHistory.push({
        role: 'assistant',
        content: aiReply,
        timestamp
      })
      updateLeadById(leadId, lead);
    }
  }

  res.status(200).end();
};

