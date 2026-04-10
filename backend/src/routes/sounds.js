import express from 'express';
import mongoose from 'mongoose';
import { getGfs } from '../config/gridfs.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import Track from '../models/Track.js';

const createSoundsRouter = (upload) => {
  const router = express.Router();

  router.post(
    '/',
    authMiddleware,
    requireAdmin,
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
    async (req, res) => {
      const audioFile = req.files?.audio?.[0];
      const coverFile = req.files?.cover?.[0];

      if (!audioFile) {
        return res.status(400).json({ error: { code: 'NO_FILE', message: 'No audio file was uploaded or it was rejected by the server.' } });
      }

      try {
        const title = String(req.body.title || '').trim();
        const category = String(req.body.category || '').trim();
        const tags = String(req.body.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        const durationSec = Number(req.body.durationSec || 120);
        const artist = String(req.body.artist || 'DeepWave').trim();
        const description = String(req.body.description || '').trim();

        if (!title || !category) {
            return res.status(400).json({ error: { code: 'MISSING_METADATA', message: 'Title and category are required.' } });
        }

        const coverUrl = coverFile
          ? `/api/sounds/stream/${coverFile.id}`
          : '';

        const newTrack = new Track({
          title,
          artist,
          category,
          tags,
          cover: coverUrl,
          description,
          durationSec: Number.isFinite(durationSec) ? durationSec : 120,
          storageUrl: `/api/sounds/stream/${audioFile.id}`,
          gridFsId: audioFile.id,
          coverGridFsId: coverFile?.id || null,
          source: 'Admin Upload',
          isActive: true,
        });

        await newTrack.save();

        res.status(201).json({
          message: 'File uploaded and track created successfully!',
          track: newTrack,
          file: audioFile,
        });

      } catch (error) {
        console.error("Error after upload (saving to DB):", error);
        res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error after file upload.' } });
      }
    }
  );

  router.get('/stream/:id', async (req, res) => {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid file ID provided.' });
    }

    try {
        const gfs = getGfs();
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        const file = await gfs.find({ _id: fileId }).next();

        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }

        res.set('Content-Type', file.contentType);
        res.set('Content-Length', file.length);
        res.set('Accept-Ranges', 'bytes');

        const readstream = gfs.openDownloadStream(file._id);
        readstream.pipe(res);

    } catch (error) {
        console.error("Error streaming file:", error);
        res.status(500).json({ error: 'Internal server error while streaming file.' });
    }
  });

  router.delete(
    '/:id',
    authMiddleware,
    requireAdmin,
    async (req, res) => {
      if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Track ID provided.' });
      }

      try {
        const track = await Track.findById(req.params.id);
        if (!track) {
          return res.status(404).json({ message: 'Track not found in database.' });
        }

        const gfs = getGfs();

        if (track.gridFsId && mongoose.Types.ObjectId.isValid(track.gridFsId)) {
          const gridFsId = new mongoose.Types.ObjectId(track.gridFsId);
          try {
            await gfs.delete(gridFsId);
          } catch (deleteError) {
            if (deleteError.message.includes('File not found')) {
              console.warn(`GridFS file already missing for ID: ${gridFsId}`);
            } else {
              throw deleteError;
            }
          }
        }

        if (track.coverGridFsId && mongoose.Types.ObjectId.isValid(track.coverGridFsId)) {
          const coverGridFsId = new mongoose.Types.ObjectId(track.coverGridFsId);
          try {
            await gfs.delete(coverGridFsId);
          } catch (deleteError) {
            if (!deleteError.message.includes('File not found')) {
              throw deleteError;
            }
          }
        }

        await Track.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: `Track "${track.title}" successfully deleted (missing file handled safely).` });

      } catch (error) {
        console.error('Error during track removal:', error);
        return res.status(500).json({ message: 'Server error during track deletion.' });
      }
    }
  );

  return router;
};

export default createSoundsRouter;
