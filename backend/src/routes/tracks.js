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
      .select('title artist category durationSec tags storageUrl cover gridFsId source createdAt')
      .sort({ createdAt: -1 })
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
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '').trim();
    const durationSec = Number(req.body.durationSec || 0);
    const storageUrl = String(req.body.storageUrl || '').trim();
    const artist = String(req.body.artist || 'DeepWave').trim();
    const cover = String(req.body.cover || '').trim();
    const tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

    if (!title || !category || !storageUrl) {
      return res.status(400).json({
        error: { code: 'invalid_input', message: 'Title, category, and storageUrl are required.' }
      });
    }

    const track = await Track.create({
      title,
      artist,
      category,
      durationSec,
      storageUrl,
      cover,
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
