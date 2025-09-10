// server/services/openaiClients.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const TEMP_VAL = parseFloat(process.env.OPENAI_TEMPERATURE);
const TEMPERATURE = Number.isFinite(TEMP_VAL) ? TEMP_VAL : 0.7;

const MAX_DEV_CALLS = parseInt(process.env.OPENAI_DEV_MAX_CALLS || '50', 10);
let devCallCount = 0;
const askCache = new Map();
const summarizeCache = new Map();

const checkQuota = () => {
  if (process.env.NODE_ENV === 'development') {
    if (devCallCount >= MAX_DEV_CALLS) {
      throw new Error('OpenAI development quota exceeded');
    }
    devCallCount += 1;
  }
};

export const askAI = async (messages) => {
  try {
    const cacheKey = JSON.stringify(messages);
    if (process.env.NODE_ENV === 'development' && askCache.has(cacheKey)) {
      return askCache.get(cacheKey);
    }

    checkQuota();

    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: TEMPERATURE,
      max_tokens: 150,
    });
    const aiReply = response.choices[0].message.content.trim();

    const timestamp = new Date().toISOString();
    let status = "Answered";

    if (/yes|interested|sounds good|sure|okay|can you|do you offer/i.test(aiReply)) {
      status = "Qualified";
    }
    const result = { aiReply, timestamp, status };
    if (process.env.NODE_ENV === 'development') {
      askCache.set(cacheKey, result);
    }
    return result;
  } catch (err) {
    console.error('❌ OpenAI Error:', err.message);
    throw new Error('Failed to generate AI response');
  }
};

export const summarizeLead = async (lead) => {
  try {
    const historyText = (lead.callHistory || [])
      .map(entry => {
        const ai = typeof entry.ai === 'object' ? entry.ai.aiReply : entry.ai;
        return `Prospect: ${entry.user}\nAgent: ${ai}`;
      })
      .join('\n');

    const messages = [
      {
        role: 'system',
        content:
          "You summarize conversations between solar reps and homeowners. Provide a short summary and suggest a follow-up step.",
      },
      {
        role: 'user',
        content: historyText || 'No conversation history.',
      },
    ];

    const cacheKey = JSON.stringify(lead);
    if (process.env.NODE_ENV === 'development' && summarizeCache.has(cacheKey)) {
      return summarizeCache.get(cacheKey);
    }

    checkQuota();

    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: TEMPERATURE,
      max_tokens: 120,
    });

    const summary = response.choices[0].message.content.trim();
    if (process.env.NODE_ENV === 'development') {
      summarizeCache.set(cacheKey, summary);
    }
    return summary;
  } catch (err) {
    console.error('❌ OpenAI Summary Error:', err.message);
    return 'Summary unavailable';
  }
};
