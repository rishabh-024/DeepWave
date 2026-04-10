export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const paginatedResponse = (
  data,
  page = 1,
  limit = 10,
  total = 0,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
};

export const listResponse = (items, count = items.length, message = 'Success') => {
  return {
    success: true,
    message,
    data: items,
    count,
    timestamp: new Date().toISOString(),
  };
};

export const responseMiddleware = (req, res, next) => {
  // Helper to send success responses
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  };

  res.paginated = (data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  };

  res.list = (items, count = items.length, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data: items,
      count,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  };

  res.created = (data, message = 'Created successfully', location = null) => {
    if (location) {
      res.set('Location', location);
    }
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  };

  res.noContent = () => {
    return res.status(204).send();
  };

  next();
};

export const errorResponse = (
  message,
  statusCode = 500,
  code = 'ERROR',
  details = null
) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
};

export default {
  successResponse,
  paginatedResponse,
  listResponse,
  responseMiddleware,
  errorResponse,
};
