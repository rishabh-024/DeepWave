import express from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import Mood from '../models/Mood.js';
import User from '../models/User.js';
import Track from '../models/Track.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const moodsLogged = await Mood.countDocuments({ user: userId });

    const totalMoods = moodsLogged > 0 ? moodsLogged : 1;
    const calmMoods = await Mood.countDocuments({ user: userId, mood: 'calm' });
    const calmScore = Math.round((calmMoods / totalMoods) * 100);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyMoods = await Mood.countDocuments({ user: userId, createdAt: { $gte: oneWeekAgo } });
    const weeklyAverage = (weeklyMoods / 7).toFixed(1);
    
    const longestStreak = 0;

    res.json({
      stats: {
        moodsLogged,
        calmScore,
        longestStreak,
        weeklyAverage,
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
      const totalTracks = await Track.countDocuments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newSignupsToday = await User.countDocuments({ createdAt: { $gte: today } });

      adminStats = {
        totalUsers,
        totalTracks,
        newSignupsToday,
        activeSessions: 0,
      };
    }

    const personalStats = {
      moodsLogged: await Mood.countDocuments({ user: userId }),
      listeningTime: '0 hours',
      favoriteCategory: 'Nature',
    };
    
    const recentTracks = [
        { id: 1, title: 'Peaceful Ocean Waves', category: 'Nature' },
        { id: 2, title: 'Rain on a Tin Roof', category: 'Rain' },
    ];


    res.json({
      personalStats,
      adminStats,
      recentTracks,
    });

  } catch (err) {
    console.error("Profile stats error:", err);
    res.status(500).json({ error: 'Server error fetching profile stats' });
  }
});

export default router;