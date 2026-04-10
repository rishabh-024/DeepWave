import express from 'express';
import { db } from '../utils/database.js';
import { createNLPClient } from '../utils/httpClient.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';

const router = express.Router();

router.get('/health/live', async (req, res) => {
  try {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date(),
      uptime: process.uptime(),
      pid: process.pid,
      environment: config.env,
    });
  } catch (error) {
    logger.error('Liveness probe error', { error: error.message });
    res.status(503).json({
      status: 'error',
      timestamp: new Date(),
      error: 'Service unavailable',
    });
  }
});

router.get('/health/ready', async (req, res) => {
  try {
    const checks = {
      database: null,
      nlpService: null,
    };

    const dbHealth = await db.healthCheck();
    checks.database = dbHealth.status === 'healthy';

    try {
      const nlpClient = createNLPClient(config.external.nlpServiceUrl);
      const nlpHealth = await nlpClient.healthCheck();
      checks.nlpService = nlpHealth.status === 'healthy' || nlpHealth.status === 'available';
    } catch (error) {
      checks.nlpService = false;
      logger.warn('NLP service unavailable for readiness check', { error: error.message });
    }

    const isReady = checks.database && checks.nlpService;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not-ready',
      timestamp: new Date(),
      checks,
    });
  } catch (error) {
    logger.error('Readiness probe error', { error: error.message });
    res.status(503).json({
      status: 'error',
      timestamp: new Date(),
      error: 'Failed to check readiness',
    });
  }
});

router.get('/health', async (req, res) => {
  try {
    const dbStats = db.getConnectionStats();
    const dbHealth = await db.healthCheck();

    let nlpServiceStatus = 'unavailable';
    try {
      const nlpClient = createNLPClient(config.external.nlpServiceUrl);
      const nlpHealth = await Promise.race([
        nlpClient.healthCheck(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('NLP service timeout')), 5000)
        ),
      ]);
      nlpServiceStatus = nlpHealth.status === 'healthy' ? 'healthy' : 'degraded';
    } catch (error) {
      logger.warn('NLP service health check failed', { error: error.message });
      nlpServiceStatus = 'unavailable';
    }

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const health = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date(),
      uptime: process.uptime(),
      pid: process.pid,
      environment: config.env,
      version: config.app.version,
      services: {
        database: {
          status: dbHealth.status,
          connected: dbHealth.connected,
          poolStats: dbStats,
        },
        nlpService: {
          status: nlpServiceStatus,
          url: config.external.nlpServiceUrl,
        },
      },
      resources: {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
    };

    const isHealthy = dbHealth.status === 'healthy' && nlpServiceStatus !== 'unavailable';
    health.overall = isHealthy ? 'healthy' : 'degraded';

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check error', { error: error.message });
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      error: 'Failed to perform health check',
      message: config.env === 'development' ? error.message : undefined,
    });
  }
});

router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    service: config.app.name,
    version: config.app.version,
    environment: config.env,
  });
});

router.get('/health/dependencies', async (req, res) => {
  try {
    const dependencies = {
      mongodb: {
        name: 'MongoDB',
        status: 'checking',
      },
      nlpService: {
        name: 'NLP Service',
        status: 'checking',
        url: config.external.nlpServiceUrl,
      },
    };

    try {
      const dbHealth = await db.healthCheck();
      dependencies.mongodb.status = dbHealth.status;
    } catch (error) {
      dependencies.mongodb.status = 'error';
      dependencies.mongodb.error = error.message;
    }

    try {
      const nlpClient = createNLPClient(config.external.nlpServiceUrl);
      const nlpHealth = await Promise.race([
        nlpClient.healthCheck(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]);
      dependencies.nlpService.status = nlpHealth.status || 'healthy';
    } catch (error) {
      dependencies.nlpService.status = 'error';
      dependencies.nlpService.error = error.message;
    }

    const allHealthy = Object.values(dependencies).every(
      dep => dep.status === 'healthy' || dep.status === 'available'
    );

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'all-healthy' : 'some-unhealthy',
      timestamp: new Date(),
      dependencies,
    });
  } catch (error) {
    logger.error('Dependencies health check error', { error: error.message });
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      error: 'Failed to check dependencies',
    });
  }
});

export default router;
