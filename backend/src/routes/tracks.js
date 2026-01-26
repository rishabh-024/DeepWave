import express from 'express';
import Track from '../models/Track.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, q, limit = 50 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const tracks = await Track.find(filter)
      .select('title category durationSec tags')
      .limit(Number(limit))
      .lean();

    res.json({ tracks });
  } catch (err) {
    logger.error('Error fetching tracks', { error: err.message, stack: err.stack, query: req.query });
    res.status(500).json({
      error: { code: 'server_error', message: 'Internal error' }
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const t = await Track.findById(req.params.id).lean();
    if (!t) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Track not found' }
      });
    }
    res.json({ track: t });
  } catch (err) {
    logger.error('Error fetching track by ID', { error: err.message, stack: err.stack, trackId: req.params.id });
    res.status(500).json({
      error: { code: 'server_error', message: 'Internal error' }
    });
  }
});

router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { title, category, durationSec, storageUrl, tags } = req.body;

    const track = await Track.create({
      title,
      category,
      durationSec,
      storageUrl,
      tags,
      isActive: true
    });

    res.status(201).json({ track });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: { code: 'server_error', message: 'Internal error' }
    });
  }
});

export default router;
