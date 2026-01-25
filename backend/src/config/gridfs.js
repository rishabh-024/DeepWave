import mongoose from 'mongoose';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

let gfs = null;
let uploadInstance = null;

export const initGridFS = () => {
  const conn = mongoose.connection;

  if (!conn || conn.readyState !== 1) {
    console.warn('⚠️ MongoDB connection not yet open. GridFS initialization delayed.');
    return;
  }

  if (!gfs) {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads',
    });
    console.log('✅ GridFS Bucket initialized and ready.');
  }
};

export const getGfs = () => {
  if (!gfs) {
    console.warn('⚠️ GridFS not initialized yet. Attempting to reinitialize...');
    initGridFS();
  }
  if (!gfs) {
    throw new Error('❌ GridFS Bucket is still not initialized after retry.');
  }
  return gfs;
};

export const createUploadInstance = () => {
  if (uploadInstance) return uploadInstance;

  const storage = new GridFsStorage({
    db: mongoose.connection.db,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) return reject(err);

          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename,
            bucketName: 'uploads',
            metadata: {
              originalName: file.originalname,
              uploadedAt: new Date(),
              uploadedBy: req?.user?.email || 'unknown',
            },
          };
          resolve(fileInfo);
        });
      });
    },
  });

  uploadInstance = multer({ storage });
  return uploadInstance;
};

mongoose.connection.once('open', () => {
  console.log('🔗 MongoDB connected — initializing GridFS...');
  initGridFS();
});