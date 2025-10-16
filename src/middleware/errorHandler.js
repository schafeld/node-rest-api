const logger = require('../utils/logger');
const config = require('../config/environment');
const { AppError } = require('../utils/errors');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  // Handle null/undefined errors
  if (!err) {
    const defaultError = new Error('Internal Server Error');
    err = defaultError;
  }
  
  // Generate unique request ID if not present
  const requestId = req.id || Math.random().toString(36).substr(2, 9);
  req.id = requestId;

  const logData = {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: err.message || 'Unknown error',
    stack: err.stack || 'No stack trace available'
  };

  if (err.statusCode >= 500) {
    logger.error('Server error', logData);
  } else {
    logger.warn('Client error', logData);
  }

  // Don't expose sensitive information in production
  const isDevelopment = config.NODE_ENV === 'development';

  // Handle known error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
        ...(isDevelopment && { stack: err.stack })
      },
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // Handle Joi validation errors (fallback)
  if (err.isJoi) {
    const validationDetails = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationDetails
      },
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // Handle Express.js built-in errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON format in request body'
      },
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload too large'
      },
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // Handle NotFoundError specifically
  if (err.code === 'NOT_FOUND') {
    let cleanMessage = err.message;
    // Remove duplicate "not found" phrases
    if (cleanMessage.includes(' not found not found')) {
      cleanMessage = cleanMessage.replace(' not found not found', ' not found');
    }
    
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: cleanMessage
      },
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // Handle errors with specific status codes and codes
  const statusCode = err.statusCode || err.status || 500;
  let errorCode = 'UNKNOWN_ERROR';
  let message = err.message || 'Internal Server Error';

  if (statusCode === 400) {
    errorCode = err.code || 'VALIDATION_ERROR';
  } else if (statusCode === 404) {
    errorCode = 'NOT_FOUND';
  } else if (statusCode === 429) {
    errorCode = err.code || 'RATE_LIMIT_EXCEEDED';
  } else if (statusCode === 500) {
    errorCode = 'INTERNAL_SERVER_ERROR';
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(isDevelopment && statusCode === 500 && { 
        originalMessage: err.message,
        stack: err.stack 
      })
    },
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      availableRoutes: [
        'GET /api/v1/items',
        'GET /api/v1/items/:id',
        'POST /api/v1/items',
        'PUT /api/v1/items/:id',
        'DELETE /api/v1/items/:id',
        'POST /api/v1/items/reset',
        'GET /api/v1/stats',
        'GET /health'
      ]
    },
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
}

module.exports = { errorHandler, notFoundHandler };