import express from 'express';
import mongoose from 'mongoose';
import { getGfs } from '../config/gridfs.js'; // Import our centralized getGfs instance
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const process_with_deep_wave_model = (audioBuffer, filename) => {
  console.log(`--- Deep Wave Model Simulation ---`);
  console.log(`Received audio buffer for file: ${filename}`);
  console.log(`Buffer size: ${audioBuffer.length} bytes`);
  const analysis = { detectedEmotion: "calm", confidence: Math.random() * 0.3 + 0.6 };
  console.log(`Analysis complete:`, analysis);
  console.log(`---------------------------------`);
  return analysis;
};

router.post('/:fileId', authMiddleware, async (req, res) => {
  try {
    
    const gfsInstance = getGfs(); 
    if (!gfsInstance) {
        return res.status(500).json({ error: 'GridFS not initialized.' });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const files = await gfsInstance.files.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'No file exists with that ID.' });
    }
    
    const file = files[0];
    console.log(`Processing file: ${file.filename}`);

    const readstream = gfsInstance.createReadStream({ filename: file.filename });
    const chunks = [];

    readstream.on('data', (chunk) => chunks.push(chunk));
    readstream.on('error', (err) => res.status(500).json({ error: 'Failed to process file.' }));
    
    readstream.on('end', () => {
      const audioBuffer = Buffer.concat(chunks);
      const modelResult = process_with_deep_wave_model(audioBuffer, file.filename);
      res.json({ message: 'File processed successfully.', analysis: modelResult });
    });

  } catch (err) {
    console.error("Processing endpoint error:", err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;