import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Mood from '../models/Mood.js';
import User from '../models/User.js';
import Track from '../models/Track.js';
import mongoose from 'mongoose';

const router = express.Router();

const getDateKey = (value) => value.toISOString().slice(0, 10);

const calculateLongestStreak = (entries = []) => {
  if (!entries.length) {
    return 0;
  }

  const uniqueDays = [...new Set(entries.map((entry) => getDateKey(new Date(entry.createdAt))))].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDate = new Date(uniqueDays[index - 1]);
    const currentDate = new Date(uniqueDays[index]);
    const diffDays = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const moodEntries = await Mood.find({ user: userId }).sort({ createdAt: -1 }).lean();

    const moodsLogged = moodEntries.length;

    const totalMoods = moodsLogged > 0 ? moodsLogged : 1;
    const calmMoods = moodEntries.filter((entry) => entry.mood === 'calm').length;
    const calmScore = Math.round((calmMoods / totalMoods) * 100);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyMoods = moodEntries.filter((entry) => new Date(entry.createdAt) >= oneWeekAgo).length;
    const weeklyAverage = (weeklyMoods / 7).toFixed(1);
    const longestStreak = calculateLongestStreak(moodEntries);

    const previousWeekStart = new Date(oneWeekAgo);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekMoods = moodEntries.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      return createdAt >= previousWeekStart && createdAt < oneWeekAgo;
    }).length;
    const moodShift = previousWeekMoods
      ? `${Math.round(((weeklyMoods - previousWeekMoods) / previousWeekMoods) * 100)}%`
      : weeklyMoods
      ? '+100%'
      : '+0%';

    res.json({
      stats: {
        moodsLogged,
        calmScore,
        longestStreak,
        weeklyAverage,
        moodShift: moodShift.startsWith('-') ? moodShift : `+${moodShift.replace(/^\+/, '')}`,
      }
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let adminStats = null;

    if (req.user.role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalTracks = await Track.countDocuments({ isActive: true });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newSignupsToday = await User.countDocuments({ createdAt: { $gte: today } });
      const activeSessions = await Mood.countDocuments({ createdAt: { $gte: today } });

      adminStats = {
        totalUsers,
        totalTracks,
        newSignupsToday,
        activeSessions,
      };
    }

    const moodEntries = await Mood.find({ user: userId }).sort({ createdAt: -1 }).lean();
    const latestMood = moodEntries[0]?.mood || 'Calm';
    const recentTracks = await Track.find({ isActive: true })
      .select('title category')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const personalStats = {
      moodsLogged: moodEntries.length,
      listeningTime: `${Math.max(1, Math.round(moodEntries.length * 0.5))} hours`,
      favoriteCategory: latestMood.charAt(0).toUpperCase() + latestMood.slice(1),
    };

    res.json({
      personalStats,
      adminStats,
      recentTracks: recentTracks.map((track) => ({
        id: String(track._id),
        title: track.title,
        category: track.category,
      })),
    });

  } catch (err) {
    console.error("Profile stats error:", err);
    res.status(500).json({ error: 'Server error fetching profile stats' });
  }
});

export default router;
