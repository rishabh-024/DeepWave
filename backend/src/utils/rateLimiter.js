import { createRequire } from 'module';
import rateLimit from 'express-rate-limit';
import { logger } from './logger.js';

const require = createRequire(import.meta.url);

export const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  };

  return rateLimit({
    ...defaultOptions,
    ...options,
  });
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Upload limit exceeded, try again later.',
});

export const publicLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
});

export const createUserTypeLimiter = (userType = 'free', options = {}) => {
  const limiterConfig = {
    free: {
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'You have exceeded the free tier request limit. Please upgrade your account.',
    },
    premium: {
      windowMs: 60 * 60 * 1000,
      max: 1000,
      message: 'You have exceeded your request limit.',
    },
    admin: {
      windowMs: 60 * 60 * 1000,
      max: 5000,
    },
  };

  const config = limiterConfig[userType] || limiterConfig.free;

  return createRateLimiter({
    ...config,
    ...options,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
  });
};

export const createRedisLimiter = (redisClient, options = {}) => {
  let RedisStore;

  try {
    ({ default: RedisStore } = require('rate-limit-redis'));
  } catch (error) {
    throw new Error('rate-limit-redis is not installed. Install it before enabling Redis-backed rate limiting.');
  }

  const defaultOptions = {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  };

  return rateLimit({
    ...defaultOptions,
    ...options,
  });
};

export const rateLimitInfo = (req, res, next) => {
  if (req.rateLimit) {
    res.set({
      'X-RateLimit-Limit': req.rateLimit.limit,
      'X-RateLimit-Remaining': req.rateLimit.current,
      'X-RateLimit-Reset': req.rateLimit.resetTime,
    });
  }
  next();
};

export const conditionalRateLimiter = (options = {}) => {
  return (req, res, next) => {
    if (req.user?.role === 'admin') {
      return next();
    }

    const userType = req.user?.tier || 'free';
    const limiter = createUserTypeLimiter(userType);

    return limiter(req, res, next);
  };
};

export const burstLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    burstMax = 20,
    sustainedMax = 5,
  } = options;

  const limiters = {
    burst: createRateLimiter({
      windowMs,
      max: burstMax,
      handler: (req, res) => {
        const sustained = createRateLimiter({
          windowMs: 1000,
          max: sustainedMax,
        });
        return sustained(req, res, () => {
          if (req.rateLimit?.current <= 0) {
            return res.status(429).json({
              status: 'error',
              message: 'Rate limit exceeded',
            });
          }
          res.status(200);
        });
      },
    }),
  };

  return limiters.burst;
};

export const createPathBasedLimiter = (config = {}) => {
  const pathLimiters = {};

  Object.entries(config).forEach(([path, options]) => {
    pathLimiters[path] = createRateLimiter(options);
  });

  return (req, res, next) => {
    for (const [path, limiter] of Object.entries(pathLimiters)) {
      if (req.path.includes(path)) {
        return limiter(req, res, next);
      }
    }
    next();
  };
};

export const slidingWindowLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 60,
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    let requestTimes = requests.get(key);
    requestTimes = requestTimes.filter(time => time > windowStart);

    if (requestTimes.length >= max) {
      logger.warn('Sliding window rate limit exceeded', { ip: key, path: req.path });
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests',
      });
    }

    requestTimes.push(now);
    requests.set(key, requestTimes);

    if (requests.size > 10000) {
      const oldestKey = requests.keys().next().value;
      requests.delete(oldestKey);
    }

    res.set('X-RateLimit-Remaining', max - requestTimes.length);
    next();
  };
};

export default {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  publicLimiter,
  createUserTypeLimiter,
  createRedisLimiter,
  rateLimitInfo,
  conditionalRateLimiter,
  burstLimiter,
  createPathBasedLimiter,
  slidingWindowLimiter,
};
