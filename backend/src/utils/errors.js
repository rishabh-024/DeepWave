export class AppError extends Error {
  constructor(message, statusCode, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = null) {
    const message = /not found/i.test(String(resource))
      ? String(resource)
      : `${resource} not found`;

    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = 60) {
    const error = new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
    error.retryAfter = retryAfter;
    return error;
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(serviceOrMessage = 'External service', messageOrDetails = 'Request failed', details = null) {
    let service = 'External service';
    let message = 'Request failed';
    let errorDetails = details;

    if (typeof messageOrDetails === 'string') {
      service = serviceOrMessage;
      message = messageOrDetails;
    } else {
      message = serviceOrMessage;
      errorDetails = messageOrDetails ?? details;
    }

    super(`${service} error: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', errorDetails);
    this.service = service;
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details = null) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

export const getSafeErrorMessage = (error, environment = 'production') => {
  if (environment === 'development') {
    return error.message;
  }

  if (error instanceof AppError) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again later.';
};

export const formatErrorResponse = (error, requestId = null) => {
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';

  const response = {
    success: false,
    error: {
      code,
      message,
      ...(error.details && { details: error.details }),
    },
    ...(requestId && { requestId }),
    timestamp: new Date().toISOString(),
  };

  if (error.retryAfter) {
    response.retryAfter = error.retryAfter;
  }

  return { statusCode, response };
};

export default {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  InternalServerError,
  getSafeErrorMessage,
  formatErrorResponse,
};
