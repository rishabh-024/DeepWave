import express from 'express';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = (await import('openai')).default;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    logger.warn('OpenAI not available, using fallback analysis');
  }
}

async function analyzeText(text) {
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for mental health analysis. Analyze the user's text for emotions, mood, and provide supportive insights. Respond in JSON format with keys: emotion, confidence, suggestions."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      logger.error('OpenAI API error:', error.message);
      return fallbackAnalysis(text);
    }
  }
  return fallbackAnalysis(text);
}

function fallbackAnalysis(text) {
  // Simple keyword-based analysis
  const emotionKeywords = {
    happy: ['happy', 'great', 'wonderful', 'excellent', 'good', 'awesome'],
    sad: ['sad', 'depressed', 'unhappy', 'down', 'miserable'],
    angry: ['angry', 'furious', 'mad', 'irritated', 'frustrated'],
    anxious: ['anxious', 'nervous', 'worried', 'stressed', 'tension'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene'],
    neutral: []
  };

  const lowerText = text.toLowerCase();
  let detectedEmotion = 'neutral';
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(kw => lowerText.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
    }
  }

  return {
    emotion: detectedEmotion,
    intent: `emotion.${detectedEmotion}`,
    confidence: Math.min(0.9, (maxMatches + 1) / 2),
    answer: `I hear ${detectedEmotion === 'neutral' ? 'what you are sharing' : `that you may be feeling ${detectedEmotion}`}. Let me help you find a calming next step.`,
    suggestions: [
      'Take a moment to breathe deeply.',
      'Consider journaling your thoughts.',
      'Try a few minutes of meditation.'
    ]
  };
}

router.post('/analyze-text', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const result = await analyzeText(text);
    res.json({
      ...result,
      intent: result.intent || (result.emotion ? `emotion.${result.emotion}` : 'emotion.neutral'),
      answer: result.answer || result.suggestions?.[0] || 'Let me help you find a supportive next step.',
    });
  } catch (err) {
    logger.error('Analysis error:', err);
    res.status(500).json({ error: 'NLP service failed' });
  }
});

export default router;
