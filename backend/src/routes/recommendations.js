import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Track from '../models/Track.js';
import Mood from '../models/Mood.js';

const router = express.Router();

const moodToTagsMap = {
  happy: ['upbeat', 'joy', 'energetic'],
  calm: ['calm', 'ambient', 'relax'],
  stressed: ['stress', 'calm', 'relax', 'nature'],
  angry: ['calm', 'soothing', 'release'],
  sad: ['ambient', 'comfort', 'warm'],
  anxious: ['calm', 'anxious', 'soothing', 'relax'],
  neutral: ['ambient', 'focus'],
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const lastMood = await Mood.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    let searchTags = moodToTagsMap.calm;

    if (lastMood) {
      searchTags = moodToTagsMap[lastMood.mood] || searchTags;
    }

    const recommendedTracks = await Track.find({
      tags: { $in: searchTags },
      isActive: true,
    }).limit(10).lean();

    res.json({ recommendations: recommendedTracks });

  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

export default router;