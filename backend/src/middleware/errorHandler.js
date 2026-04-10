import { AppError, formatErrorResponse, getSafeErrorMessage } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  let error = err;
  let statusCode = 500;

  if (!(error instanceof AppError)) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message,
      }));
      error = new AppError('Validation failed', 400, 'VALIDATION_ERROR', messages);
    }
    else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      error = new AppError(
        `${field} already exists`,
        409,
        'DUPLICATE_RESOURCE',
        { field }
      );
    }
    else if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
    else if (error.name === 'TokenExpiredError') {
      error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    else {
      error = new AppError(
        getSafeErrorMessage(error, process.env.NODE_ENV),
        500,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  statusCode = error.statusCode|| 500;

  const errorLog = {
    requestId: req.id,
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    statusCode,
    errorCode: error.code,
    message: error.message,
    stack: error.stack,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  };

  if (statusCode >= 500) {
    logger.error('Server error', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Client error', errorLog);
  }

  const { response } = formatErrorResponse(error, req.id);

  if (error.retryAfter) {
    res.set('Retry-After', error.retryAfter.toString());
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        params: req.params,
        query: req.query,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      const validationError = new AppError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        messages
      );
      return next(validationError);
    }

    req.body = value.body;
    req.params = value.params;
    req.query = value.query;

    next();
  };
};

export const handleAuthError = (message = 'Authentication failed') => {
  return new AppError(message, 401, 'AUTHENTICATION_FAILED');
};

export const handleAuthorizationError = (message = 'Access denied') => {
  return new AppError(message, 403, 'AUTHORIZATION_FAILED');
};

export default {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  validate,
  handleAuthError,
  handleAuthorizationError,
};
