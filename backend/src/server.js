import './config/env.js';
import cors from 'cors';
import compression from 'compression';
import cluster from 'cluster';
import os from 'os';

import connectDB from './config/db.js';
import { initGridFS, createUploadInstance } from './config/gridfs.js';

import express from "express";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import logger from './utils/logger.js';

import authRoutes from './routes/auth.js';
import tracksRoutes from './routes/tracks.js';
import moodRoutes from './routes/mood.js' ;
import recRoutes from './routes/recommendations.js' ;
import chatRoutes from './routes/chat.js'
import statsRoutes from './routes/stats.js'
import healthRoutes from './routes/health.js';

import createSoundsRouter from './routes/sounds.js';
import processRoutes from './routes/process.js';
import { requestIdMiddleware, correlationIdMiddleware } from './middleware/requestIdMiddleware.js';
import { responseMiddleware } from './middleware/responseFormatter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 200;
const TRUST_PROXY = process.env.TRUST_PROXY === 'true' || false;
const CLUSTER_ENABLED = process.env.CLUSTER_ENABLED === 'true' || false;

if (CLUSTER_ENABLED && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`Primary process ${process.pid} is running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    logger.info('Starting a new worker');
    cluster.fork();
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });

} else {
  startServer();
}

async function startServer() {
  try {
    const app = express();

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    if (TRUST_PROXY) {
      app.set('trust proxy', 1);
    }

    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (CORS_ORIGINS.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(compression());

    app.use(correlationIdMiddleware);
    app.use(requestIdMiddleware);
    app.use(responseMiddleware);

    app.use(express.json({
      limit: process.env.JSON_LIMIT || '50mb',
      verify: (req, res, buf) => {
        if (!buf?.length) {
          return;
        }

        try {
          JSON.parse(buf.toString());
        } catch (e) {
          logger.error('Invalid JSON received', { error: e.message, body: buf.toString() });
          e.statusCode = 400;
          e.code = 'invalid_json';
          throw e;
        }
      }
    }));
    app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '50mb' }));

    app.use(morgan('combined', {
      stream: {
        write: (message) => {
          logger.http(message.trim());
        }
      },
      skip: (req, res) => res.statusCode < 400
    }));

    app.use('/api', healthRoutes);

    const limiter = rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      message: {
        error: {
          code: 'rate_limit_exceeded',
          message: 'Too many requests from this IP, please try again later.'
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          url: req.url,
          userAgent: req.get('User-Agent')
        });
        res.status(429).json({
          error: {
            code: 'rate_limit_exceeded',
            message: 'Too many requests from this IP, please try again later.'
          }
        });
      }
    });
    app.use('/api/', limiter);

    app.get('/healthz', (req, res) => {
      res.json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    app.get('/', (req, res) => res.json({ ok: true }));

    app.use('/api/auth', authRoutes);
    app.use('/api/tracks', tracksRoutes);
    app.use('/api/mood', moodRoutes);
    app.use('/api/recommendations', recRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/process', processRoutes);
    app.use('/api/stats', statsRoutes);

    await connectDB();
    await initGridFS();

    const uploadInstance = createUploadInstance();
    const soundsRouter = createSoundsRouter(uploadInstance);
    app.use('/api/sounds', soundsRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`, {
        pid: process.pid,
        cluster: CLUSTER_ENABLED ? 'worker' : 'single'
      });
    });

    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}
