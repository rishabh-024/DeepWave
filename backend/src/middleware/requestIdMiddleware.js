import { randomUUID } from 'crypto';

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  req.id = requestId;
  req.requestId = requestId;
  
  res.setHeader('X-Request-ID', requestId);
  
  req.log = (level, message, data = {}) => {
    return {
      requestId,
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };
  };

  const startTime = Date.now();
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return originalJson({
        ...data,
        requestId,
      });
    }

    return originalJson(data);
  };

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    req.duration = duration;
  });

  next();
};

export const correlationIdMiddleware = (req, res, next) => {
  const correlationId = 
    req.headers['x-correlation-id'] || 
    req.headers['x-request-id'] || 
    randomUUID();
  
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

export default requestIdMiddleware;
