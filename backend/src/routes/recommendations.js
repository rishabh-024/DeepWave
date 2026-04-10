import express from 'express';
import jwt from 'jsonwebtoken';
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

const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

router.get('/', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    const lastMood = user
      ? await Mood.findOne({ user: user.id }).sort({ createdAt: -1 })
      : null;

    let recommendedTracks = [];

    if (lastMood) {
      const searchTags = moodToTagsMap[lastMood.mood] || moodToTagsMap.calm;
      recommendedTracks = await Track.find({
        tags: { $in: searchTags },
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    if (!recommendedTracks.length) {
      recommendedTracks = await Track.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    res.json({ recommendations: recommendedTracks });

  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
});

export default router;
