// server/services/openaiClients.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const askAI = async (messages) => {
  try {
    // TEMP fallback:
    const fallback = "This is a temporary fallback while you're out of tokens.";
    // const aiReply = fallback;

    // Uncomment for production use:
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 150,
    });
    const aiReply = response.choices[0].message.content.trim();

    const timestamp = new Date().toISOString();
    let status = "Answered";

    if (/yes|interested|sounds good|sure|okay|can you|do you offer/i.test(aiReply)) {
      status = "Qualified";
    }

    return { aiReply, timestamp, status };
  } catch (err) {
    console.error('❌ OpenAI Error:', err.message);
    throw new Error('Failed to generate AI response');
  }
};
