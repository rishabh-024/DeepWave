import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { RateLimiterMemory } from 'rate-limiter-flexible';

dotenv.config();

import analyzeRoute from './routes/analyze.js';
import { analyzeText } from './services/nlpManager.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/nlp-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'nlp',
  points: 100,
  duration: 60,
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

app.use('/api', analyzeRoute);

app.get('/healthz', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);

  socket.on('analyze-text', async (data) => {
    try {
      const result = await analyzeText(data.text);
      socket.emit('analysis-result', result);
    } catch (error) {
      logger.error('Socket analysis error:', error);
      socket.emit('analysis-error', { error: 'Analysis failed' });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  logger.info(`NLP service running on port ${PORT}`);
});
