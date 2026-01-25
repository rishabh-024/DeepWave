import express from 'express';
import Mood from '../models/Mood.js';
import Track from '../models/Track.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const moodToActionMap = {
  stressed: { tags: ['stress', 'calm', 'relax', 'nature', 'ambient'] },
  anxious: { tags: ['anxious', 'calm', 'soothing', 'relax'] },
  sad: { tags: ['sad', 'comfort', 'warm', 'ambient'] },
  angry: { tags: ['angry', 'calm', 'release', 'soothing'] },
  happy: { tags: ['happy', 'upbeat', 'joy', 'energetic'] },
  calm: { tags: ['calm', 'focus', 'ambient'] },
};

const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "You are stronger than you think.",
  "Believe you can and you're halfway there.",
  "Every moment is a fresh beginning.",
  "The best way to predict the future is to create it.",
  "When something is important enough, You do it. Even if the odds are not in your favour."
];

router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { mood, notes } = req.body;
    if (!mood) {
      return res.status(400).json({ error: { code: 'MISSING_FIELD', message: 'Mood is required.' } });
    }

    const newMood = new Mood({ user: req.user.id, mood, notes });
    const savedMood = await newMood.save();

    const action = moodToActionMap[mood];
    let recommendations = [];
    if (action) {
      recommendations = await Track.find({ tags: { $in: action.tags } }).limit(3).lean();
    }

    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    res.status(201).json({ savedMood, recommendations, quote });

  } catch (err) {
    console.error("Error in /mood/log:", err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await Mood.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ history });
  } catch (err) {
    console.error("Error fetching mood history:", err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

export default router;