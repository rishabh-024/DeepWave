import mongoose from 'mongoose';
import { DatabaseError } from './errors.js';
import { logger } from './logger.js';

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect(uri, options = {}) {
    const defaultOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4
      retryWrites: true,
      retryReads: true,
    };

    const connectionOptions = { ...defaultOptions, ...options };

    try {
      logger.info('Attempting database connection...', { uri: uri.replace(/:[^:]*@/, ':***@') });

      await mongoose.connect(uri, connectionOptions);

      this.isConnected = true;
      this.connectionRetries = 0;

      logger.info('Database connected successfully', {
        poolSize: mongoose.connections[0]?.getClient()?.topology?.s?.pool?.totalConnectionCount || 'N/A',
      });

      this.setupConnectionListeners();

      return mongoose.connection;
    } catch (error) {
      logger.error('Database connection failed', { error: error.message });
      throw new DatabaseError(
        'Failed to connect to database',
        { originalError: error.message }
      );
    }
  }

  async reconnectWithRetry(uri, options = {}) {
    while (this.connectionRetries < this.maxRetries) {
      try {
        this.connectionRetries++;
        const delay = this.retryDelay * Math.pow(2, this.connectionRetries - 1);
        logger.warn(`Reconnecting to database... (Attempt ${this.connectionRetries}/${this.maxRetries})`, {
          delayMs: delay,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.connect(uri, options);
      } catch (error) {
        if (this.connectionRetries >= this.maxRetries) {
          logger.error('Failed to reconnect to database after max retries', {
            maxRetries: this.maxRetries,
            error: error.message,
          });
          throw error;
        }
      }
    }
  }

  setupConnectionListeners() {
    const db = mongoose.connection;

    db.on('disconnected', () => {
      logger.warn('Database disconnected');
      this.isConnected = false;
    });

    db.on('error', (error) => {
      logger.error('Database connection error', { error: error.message });
      this.isConnected = false;
    });

    db.on('reconnected', () => {
      logger.info('Database reconnected');
      this.isConnected = true;
      this.connectionRetries = 0;
    });

    db.on('close', () => {
      logger.warn('Database connection closed');
      this.isConnected = false;
    });
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        logger.info('Database disconnected');
        this.isConnected = false;
      }
    } catch (error) {
      logger.error('Error disconnecting from database', { error: error.message });
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!mongoose.connection?.db) {
        throw new Error('Database connection is not initialized');
      }

      await mongoose.connection.db.admin().ping();

      return {
        status: 'healthy',
        connected: this.isConnected,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Database health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  getConnectionStats() {
    try {
      const connection = mongoose.connections[0];
      if (!connection) {
        return null;
      }

      const client = connection.getClient();
      const topology = client?.topology;

      return {
        connected: this.isConnected,
        poolSize: topology?.s?.pool?.totalConnectionCount || 0,
        waitQueueSize: topology?.s?.pool?.waitQueueSize || 0,
        connectionString: connection.host + ':' + connection.port,
        databaseName: connection.name,
      };
    } catch (error) {
      logger.error('Error getting connection stats', { error: error.message });
      return null;
    }
  }

  async ensureIndexes() {
    try {
      logger.info('Ensuring database indexes...');
      
      const models = Object.values(mongoose.models);
      
      for (const model of models) {
        await model.syncIndexes();
        logger.debug(`Indexes ensured for ${model.modelName}`);
      }
      
      logger.info('All database indexes ensured');
    } catch (error) {
      logger.error('Error ensuring indexes', { error: error.message });
      throw error;
    }
  }

  async dropAllCollections() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop collections in production');
    }

    try {
      const collections = await mongoose.connection.listCollections();
      
      for (const collection of collections) {
        await mongoose.connection.dropCollection(collection.name);
      }
      
      logger.info('All collections dropped');
    } catch (error) {
      logger.error('Error dropping collections', { error: error.message });
      throw error;
    }
  }

  async executeTransaction(sessionCallback) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await sessionCallback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Transaction aborted', { error: error.message });
      throw new DatabaseError('Transaction failed', { originalError: error.message });
    } finally {
      await session.endSession();
    }
  }
}

export const db = new DatabaseManager();

export const queryOptimization = {
  lean: (query) => query.lean(),
  select: (query, fields) => query.select(fields),
  paginate: (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  },
  cache: (query, ttl = 300) => {
    query._cacheExpire = Date.now() + (ttl * 1000);
    return query;
  },
};

export const bulkOperations = {
  insertMany: async (model, documents, { ordered = true, session = null } = {}) => {
    try {
      const options = { ordered };
      if (session) options.session = session;
      
      const result = await model.insertMany(documents, options);
      logger.debug(`Inserted ${result.length} documents into ${model.modelName}`);
      return result;
    } catch (error) {
      logger.error(`Bulk insert failed for ${model.modelName}`, { error: error.message });
      throw new DatabaseError('Bulk insert failed', { originalError: error.message });
    }
  },

  updateMany: async (model, filter, update, options = {}) => {
    try {
      const result = await model.updateMany(filter, update, options);
      logger.debug(`Updated ${result.modifiedCount} documents in ${model.modelName}`);
      return result;
    } catch (error) {
      logger.error(`Bulk update failed for ${model.modelName}`, { error: error.message });
      throw new DatabaseError('Bulk update failed', { originalError: error.message });
    }
  },

  deleteMany: async (model, filter, options = {}) => {
    try {
      const result = await model.deleteMany(filter, options);
      logger.debug(`Deleted ${result.deletedCount} documents from ${model.modelName}`);
      return result;
    } catch (error) {
      logger.error(`Bulk delete failed for ${model.modelName}`, { error: error.message });
      throw new DatabaseError('Bulk delete failed', { originalError: error.message });
    }
  },
};

export default db;
