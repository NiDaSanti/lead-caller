import { askAI } from '../services/openaiClients.js';
import { getLeadById, saveLeadUpdate } from '../services/leadDataService.js';
import { initiateCall } from '../services/twilioService.js';
import { readLeads, updateLeadById } from '../utils/leadUtils.js';
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
  console.log('Recording Received: ', req.body);
  const {
    SpeechResult,
    TranscriptionText,
    RecordingUrl: recordingUrl
  } = req.body;
  const transcription = SpeechResult || TranscriptionText;
  const { leadId } = req.query;
  const id = Number(leadId);

  console.log("📞 /continue called");
  console.log("Lead ID:", id);
  console.log("Transcription:", transcription || "⏳ Not received yet");
  if (recordingUrl) {
    console.log("Recording URL:", recordingUrl);
  }

  // If nothing was captured, prompt again then hang up if still silent
  if (!transcription) {
    const twiml = new twilio.twiml.VoiceResponse();
    const gather = twiml.gather({
      input: 'speech',
      action: `/api/phone/continue?leadId=${id}`,
      speechTimeout: 'auto',
      bargeIn: true,
      language: 'en-US'
    });
    gather.say({ voice: 'Polly.Matthew', language: 'en-US' }, "Sorry, I didn't catch that. Could you repeat?");
    twiml.say("No problem, I'll try again later. Goodbye.");
    twiml.hangup();
    return res.type('text/xml').send(twiml.toString());
  }

  const leads = readLeads();
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    console.error("❌ Lead not found:", id);
    return res.status(404).send("Lead not found");
  }

  try {
    const { aiReply } = await askAI([
      {
        role: 'system',
        content: `You're a solar represenative qualifying a homeowner. Speak casually and emotionally.`
      },
      {
        role: 'user',
        content: transcription
      }
    ]);

    // Save response to call history
    const updatedHistory = [
      ...(lead.callHistory || []),
      {
        user: transcription,
        ai: aiReply,
        timestamp: new Date().toISOString(),
      },
    ];

    updateLeadById(id, { callHistory: updatedHistory });

    // Build TwiML response that feels conversational
    const twiml = new twilio.twiml.VoiceResponse();
    const gather = twiml.gather({
      input: 'speech',
      action: `/api/phone/continue?leadId=${id}`,
      speechTimeout: 'auto',
      bargeIn: true,
      language: 'en-US'
    });
    gather.say({ voice: 'Polly.Matthew', language: 'en-US' }, aiReply);
    twiml.say('Thanks for your time. Goodbye!');
    twiml.hangup();

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
      lead.followUpDate = null;
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

  // Start a natural conversation without a dial tone
  const gather = twiml.gather({
    input: 'speech',
    action: `/api/phone/continue?leadId=${leadId}`,
    speechTimeout: 'auto',
    bargeIn: true,
    language: 'en-US'
  });
  gather.say(
    {
      voice: 'Polly.Matthew',
      language: 'en-US'
    },
    "Hi there, this is Alex from Solar Savings. Thanks for taking my call. I'm looking to help folks lower their electric bills. About how much do you pay each month?"
  );

  // If nothing is said, gracefully end the call
  twiml.say("Alright, I'll try again another time. Have a great day!");
  twiml.hangup();

  res.type('text/xml');
  res.send(twiml.toString());
};


// 🔹 New: Receive and store real-time transcript
export const receiveTranscript = async (req, res) => {
  const { SpeechResult, leadId } = req.body;
  const id = Number(leadId)
  const timestamp = new Date().toISOString();

  console.log(`📝 Transcript received for ${id}:`, SpeechResult);

  if (!Number.isNaN(id) && SpeechResult) {
    // Append transcript to callHistory (mock implementation — adapt as needed)
    const leads = readLeads();
    const lead = leads.find(l => l.id === id);
    if (lead) {
      let aiReply = ''
      try {
        ({ aiReply } = await askAI([
          {
            role: 'system',
            content: `You're a solar represenative qualifying a homeowner. Speak casually and emotionally.`
          },
          {
            role: 'user',
            content: SpeechResult
          }
        ]))
      } catch(err) {
        console.error ('AI reply failed: ', err);
        aiReply = 'AI response unavailable'
      }
      lead.callHistory = lead.callHistory || [];
      lead.callHistory.push({
        user: SpeechResult,
        ai: aiReply,  // You can replace this with real AI response logic
        timestamp
      });
      updateLeadById(id, lead);
    }
  }

  res.status(200).end();
};

