import express from 'express';
import mongoose from 'mongoose';
import { getGfs } from '../config/gridfs.js';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import Track from '../models/Track.js';

const createSoundsRouter = (upload) => {
  const router = express.Router();

  const debugMiddleware = (req, res, next) => {
    console.log('--- Request Received ---');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    next();
  };

  router.post(
    '/',
    debugMiddleware,
    authMiddleware,
    requireAdmin,
    upload.single('audio'),
    async (req, res) => {
      console.log('Multer processing complete.');
      console.log('Request file (req.file):', req.file);
      console.log('Request body (req.body):', req.body);

      if (!req.file) {
        console.log('Upload failed: req.file is missing.');
        return res.status(400).json({ error: { code: 'NO_FILE', message: 'No audio file was uploaded or it was rejected by the server.' } });
      }

      try {
        const { title, category, tags, cover, durationSec } = req.body;

        if (!title || !category) {
            return res.status(400).json({ error: { code: 'MISSING_METADATA', message: 'Title and category are required.' } });
        }

        const newTrack = new Track({
          title,
          category,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          cover: cover || 'https://placehold.co/600x400/0b1021/ffffff?text=DeepWave',
          durationSec: durationSec || 120,
          storageUrl: `/api/sounds/stream/${req.file.id}`,
          gridFsId: req.file.id,
          source: 'Admin Upload',
          isActive: true,
        });

        await newTrack.save();

        res.status(201).json({
          message: 'File uploaded and track created successfully!',
          track: newTrack,
          file: req.file,
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

        if (!file || file.length === 0) {
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
            console.log(`Deleted GridFS file with ID: ${gridFsId}`);
          } catch (deleteError) {
            if (deleteError.message.includes('File not found')) {
              console.warn(`GridFS file already missing for ID: ${gridFsId}`);
            } else {
              throw deleteError;
            }
          }
        }

        await Track.findByIdAndDelete(req.params.id);
        console.log(`Deleted track metadata for ID: ${req.params.id}`);

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