const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const baseConfig = {
    env,
    app: {
      name: 'DeepWave',
      version: '1.0.0',
      port: parseInt(process.env.PORT) || 4000,
      host: process.env.HOST || 'localhost',
    },
    database: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/deepwave',
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: parseInt(process.env.DB_IDLE_TIME) || 30000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
      serverSelectionTimeoutMS: parseInt(process.env.DB_SELECTION_TIMEOUT) || 5000,
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      jwtExpiry: process.env.JWT_EXPIRY || '7d',
      refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
      corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
      trustProxy: process.env.TRUST_PROXY === 'true',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      skip: (req) => {
        return req.path === '/health' || req.path === '/status';
      },
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 14,
      directory: process.env.LOG_DIR || './logs',
    },
    cache: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL) || 3600,
      type: process.env.CACHE_TYPE || 'memory',
    },
    storage: {
      type: process.env.STORAGE_TYPE || 'gridfs',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
      allowedMimes: (process.env.ALLOWED_MIMES || 'audio/mpeg,audio/wav,audio/ogg').split(','),
    },
    external: {
      nlpServiceUrl: process.env.NLP_SERVICE_URL || 'http://localhost:5001',
      nlpServiceTimeout: parseInt(process.env.NLP_SERVICE_TIMEOUT) || 10000,
    },
    cluster: {
      enabled: process.env.CLUSTER_ENABLED === 'true',
      workers: parseInt(process.env.CLUSTER_WORKERS) || 0,
    },
    features: {
      enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
      enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
    },
  };

  const envConfigs = {
    production: {
      security: {
        ...baseConfig.security,
        corsOrigins: (process.env.PRODUCTION_CORS_ORIGINS || 'https://deepwave.app').split(','),
      },
      logging: {
        ...baseConfig.logging,
        level: 'warn',
      },
    },
    staging: {
      security: {
        ...baseConfig.security,
        corsOrigins: (process.env.STAGING_CORS_ORIGINS || 'https://staging.deepwave.app').split(','),
      },
    },
    development: {
      logging: {
        ...baseConfig.logging,
        level: 'debug',
      },
    },
    test: {
      database: {
        ...baseConfig.database,
        uri: 'mongodb://localhost:27017/deepwave-test',
      },
      rateLimit: {
        ...baseConfig.rateLimit,
        skip: () => true,
      },
    },
  };

  const config = {
    ...baseConfig,
    ...(envConfigs[env] || {}),
  };

  if (envConfigs[env]) {
    Object.keys(envConfigs[env]).forEach(key => {
      if (config[key]) {
        config[key] = {
          ...config[key],
          ...envConfigs[env][key],
        };
      }
    });
  }

  return config;
};

export const config = getConfig();

export const validateConfig = () => {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
  ];

  if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('PRODUCTION_CORS_ORIGINS');
  }

  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

export default config;
