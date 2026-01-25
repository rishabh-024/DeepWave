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

import createSoundsRouter from './routes/sounds.js';
import processRoutes from './routes/process.js';

// Environment variables with defaults
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 200;
const TRUST_PROXY = process.env.TRUST_PROXY === 'true' || false;
const CLUSTER_ENABLED = process.env.CLUSTER_ENABLED === 'true' || false;

// Clustering for production scalability
if (CLUSTER_ENABLED && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`Primary process ${process.pid} is running. Forking ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exits
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    logger.info('Starting a new worker');
    cluster.fork();
  });

  // Graceful shutdown
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

    // Security middleware
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

    // Trust proxy for rate limiting behind load balancers
    if (TRUST_PROXY) {
      app.set('trust proxy', 1);
    }

    // CORS configuration
    app.use(cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
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

    // Compression
    app.use(compression());

    // Body parsing
    app.use(express.json({
      limit: process.env.JSON_LIMIT || '50mb',
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf);
        } catch (e) {
          logger.error('Invalid JSON received', { error: e.message, body: buf.toString() });
          res.status(400).json({ error: { code: 'invalid_json', message: 'Invalid JSON' } });
          throw new Error('Invalid JSON');
        }
      }
    }));
    app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_LIMIT || '50mb' }));

    // Logging middleware
    app.use(morgan('combined', {
      stream: {
        write: (message) => {
          logger.http(message.trim());
        }
      },
      skip: (req, res) => res.statusCode < 400 // Only log errors and above
    }));

    // Rate limiting
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

    // Health check endpoint
    app.get('/healthz', (req, res) => {
      res.json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/tracks', tracksRoutes);
    app.use('/api/mood', moodRoutes);
    app.use('/api/recommendations', recRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/process', processRoutes);
    app.use('/api/stats', statsRoutes);

    // Connect to database
    await connectDB();
    await initGridFS();

    const uploadInstance = createUploadInstance();
    const soundsRouter = createSoundsRouter(uploadInstance);
    app.use('/api/sounds', soundsRouter);

    // Global error handler
    app.use((err, req, res, next) => {
      logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Don't leak error details in production
      const isDevelopment = NODE_ENV === 'development';
      res.status(err.status || 500).json({
        error: {
          code: err.code || 'server_error',
          message: isDevelopment ? err.message : 'Internal server error'
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      logger.warn('404 Not Found', {
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Endpoint not found'
        }
      });
    });

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`, {
        pid: process.pid,
        cluster: CLUSTER_ENABLED ? 'worker' : 'single'
      });
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
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