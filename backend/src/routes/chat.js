import express from 'express';
import fetch from 'node-fetch';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Track from '../models/Track.js';

const chatRoutes = express.Router();

/**
 * Map NLP emotion intents to responses + track tags
 */
const emotionToActionMap = {
  'emotion.stress': {
    responseText:
      "It sounds like you're dealing with a lot of stress. I've found some calming sounds that might help bring a moment of peace.",
    tags: ['stress', 'calm', 'relax', 'nature', 'ambient'],
  },
  'emotion.anxious': {
    responseText:
      "Feeling anxious can be tough. I've found some soothing audio designed to help quiet the mind.",
    tags: ['anxious', 'calm', 'soothing', 'relax'],
  },
  'emotion.sad': {
    responseText:
      "I'm sorry to hear you're feeling low. Sometimes, gentle music can be a real comfort. Here are a few tracks I found for you.",
    tags: ['sad', 'comfort', 'warm', 'ambient'],
  },
  'emotion.anger': {
    responseText:
      "It's completely okay to feel angry. If you need a moment to cool down, these sounds might help create some space for you.",
    tags: ['anger', 'calm', 'release', 'soothing'],
  },
};

/**
 * Fallback affirmations (used when NLP fails or confidence is low)
 */
const affirmations = [
  "You are capable of amazing things.",
  "Your potential is limitless.",
  "Every day is a new opportunity to grow.",
  "You have the power to create the life you desire.",
  "Believe in yourself and all that you are.",
];

/**
 * Call external NLP service
 */
const callNlpService = async (text) => {
  try {
    const response = await fetch(
      `${process.env.NLP_SERVICE_URL}/api/analyze-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        timeout: 3000, // prevent hanging requests
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('NLP service unavailable:', err.message);
    return null;
  }
};

/**
 * Chat endpoint
 */
chatRoutes.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    let intent = null;
    let confidence = 0;
    let answer = null;

    // 🔗 Call NLP API
    const nlpResult = await callNlpService(message);

    if (nlpResult) {
      intent = nlpResult.intent;
      confidence = nlpResult.confidence;
      answer = nlpResult.answer;
    }

    let responsePayload = {};

    // 🎯 Emotion-based recommendation logic
    if (intent && intent.startsWith('emotion.') && confidence > 0.5) {
      const action = emotionToActionMap[intent];

      if (action) {
        const tracks = await Track.find({
          tags: { $in: action.tags },
          isActive: true,
        })
          .limit(3)
          .lean();

        responsePayload = {
          reply: action.responseText,
          recommendations: tracks.map((t) => ({
            _id: t._id,
            title: t.title,
            category: t.category,
          })),
        };
      }
    }

    // 🧯 Fallback (NLP down / low confidence)
    if (!responsePayload.reply) {
      responsePayload.reply =
        answer ||
        affirmations[Math.floor(Math.random() * affirmations.length)];
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default chatRoutes;
