import express from 'express';
import fetch from 'node-fetch';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Track from '../models/Track.js';

const chatRoutes = express.Router();
const NLP_TIMEOUT_MS = Number(process.env.NLP_SERVICE_TIMEOUT || 3000);

const intentToActionMap = {
  'emotion.stress': {
    responseText:
      "It sounds like you're dealing with a lot of stress. I've found some calming sounds that might help bring a moment of peace.",
    tags: ['stress', 'calm', 'relax', 'nature', 'ambient'],
  },
  'emotion.stressed': {
    responseText:
      "It sounds like you're carrying some pressure right now. Here are a few calming soundscapes that can help you settle in.",
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
  'emotion.angry': {
    responseText:
      "It's completely okay to feel angry. If you need a moment to cool down, these sounds might help create some space for you.",
    tags: ['anger', 'calm', 'release', 'soothing'],
  },
  'emotion.calm': {
    responseText:
      "You're already in a calmer state. Here are a few immersive soundscapes to help you stay there.",
    tags: ['calm', 'ambient', 'focus'],
  },
  'emotion.happy': {
    responseText:
      "It's great to hear you're feeling good. Here are a few uplifting soundscapes to keep the momentum going.",
    tags: ['happy', 'upbeat', 'joy', 'energetic'],
  },
  'goal.focus': {
    responseText:
      "If you want to settle in and focus, these steady soundscapes can help reduce distractions and keep you grounded.",
    tags: ['focus', 'calm', 'ambient'],
  },
  'request.calm': {
    responseText:
      "Here are a few calming soundscapes that can help you unwind and slow things down for a moment.",
    tags: ['calm', 'relax', 'ambient', 'soothing'],
  },
  'request.sleep': {
    responseText:
      "If you're trying to wind down for sleep, these softer tracks should help create a quieter, more restful atmosphere.",
    tags: ['sleep', 'calm', 'ambient', 'relax'],
  },
};

const localIntentRules = [
  {
    intent: 'goal.focus',
    confidence: 0.86,
    keywords: ['focus', 'concentrate', 'study', 'working', 'productive'],
    answer:
      'Let me help you find something steady and distraction-free.',
  },
  {
    intent: 'request.sleep',
    confidence: 0.84,
    keywords: ['sleep', 'bedtime', 'rest', 'insomnia', 'fall asleep'],
    answer:
      'Let me help you ease into a quieter, more restful space.',
  },
  {
    intent: 'request.calm',
    confidence: 0.82,
    keywords: ['calm', 'calming', 'relax', 'relaxing', 'soothing', 'peaceful'],
    answer:
      'Let me help you find something gentle and calming.',
  },
  {
    intent: 'emotion.stress',
    confidence: 0.88,
    keywords: ['stress', 'stressed', 'overwhelmed', 'pressure', 'burned out'],
    answer:
      'It sounds like things feel heavy right now. Let me find something calming for you.',
  },
  {
    intent: 'emotion.anxious',
    confidence: 0.88,
    keywords: ['anxious', 'anxiety', 'nervous', 'worried', 'panic'],
    answer:
      'I hear that you may be feeling anxious. Let me help you slow things down.',
  },
  {
    intent: 'emotion.anger',
    confidence: 0.87,
    keywords: ['angry', 'anger', 'mad', 'furious', 'irritated', 'frustrated'],
    answer:
      'That sounds frustrating. Let me help you create a little breathing room.',
  },
  {
    intent: 'emotion.sad',
    confidence: 0.86,
    keywords: ['sad', 'down', 'low', 'lonely', 'unhappy', 'depressed'],
    answer:
      'I hear that you might be feeling low. Let me find something gentle for you.',
  },
  {
    intent: 'emotion.happy',
    confidence: 0.8,
    keywords: ['happy', 'great', 'good', 'joy', 'excited', 'wonderful'],
    answer:
      'I am glad to hear that. Let me find something that matches that energy.',
  },
  {
    intent: 'emotion.calm',
    confidence: 0.78,
    keywords: ['calm', 'steady', 'peaceful', 'relaxed', 'serene'],
    answer:
      'That calmer energy is worth holding onto. Let me find something that fits it.',
  },
];

const affirmations = [
  'You are capable of amazing things.',
  'Your potential is limitless.',
  'Every day is a new opportunity to grow.',
  'You have the power to create the life you desire.',
  'Believe in yourself and all that you are.',
];

const callNlpService = async (text) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NLP_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NLP_SERVICE_URL}/api/analyze-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('NLP service unavailable:', err.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const analyzeMessageLocally = (text) => {
  const normalizedText = text.toLowerCase();
  let bestMatch = null;

  for (const rule of localIntentRules) {
    const matchCount = rule.keywords.filter((keyword) => normalizedText.includes(keyword)).length;

    if (!matchCount) {
      continue;
    }

    if (!bestMatch || matchCount > bestMatch.matchCount) {
      bestMatch = { ...rule, matchCount };
    }
  }

  if (!bestMatch) {
    return null;
  }

  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    answer: bestMatch.answer,
  };
};

const buildRecommendations = async (tags) => {
  const tracks = await Track.find({
    tags: { $in: tags },
    isActive: true,
  })
    .select('title category storageUrl cover artist gridFsId')
    .limit(3)
    .lean();

  return tracks.map((track) => ({
    _id: track._id,
    title: track.title,
    category: track.category,
    storageUrl: track.storageUrl,
    cover: track.cover,
    artist: track.artist,
    gridFsId: track.gridFsId,
  }));
};

chatRoutes.post('/', authMiddleware, async (req, res) => {
  try {
    const message = String(req.body.message || '').trim();

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message is too long.' });
    }

    let intent = null;
    let confidence = 0;
    let answer = null;
    let emotion = null;

    const nlpResult = await callNlpService(message);

    if (nlpResult) {
      intent = nlpResult.intent || null;
      emotion = nlpResult.emotion || null;
      confidence = nlpResult.confidence || 0;
      answer = nlpResult.answer || nlpResult.suggestions?.[0] || null;
    }

    if (!intent && emotion) {
      intent = `emotion.${emotion}`;
    }

    const hasActionForIntent = intent && intentToActionMap[intent];
    const localAnalysis = analyzeMessageLocally(message);

    if ((!hasActionForIntent || confidence <= 0.5) && localAnalysis) {
      intent = localAnalysis.intent;
      confidence = localAnalysis.confidence;
      answer = answer || localAnalysis.answer;
    }

    let responsePayload = {};

    if (intent && confidence > 0.5) {
      const action = intentToActionMap[intent];

      if (action) {
        responsePayload = {
          reply: action.responseText,
          recommendations: await buildRecommendations(action.tags),
        };
      }
    }

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
