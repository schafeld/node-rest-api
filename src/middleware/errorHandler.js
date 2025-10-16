const logger = require('../utils/logger');
const config = require('../config/environment');
const { AppError } = require('../utils/errors');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  const logData = {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: err.message,
    stack: err.stack
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
        message: 'Invalid JSON in request body'
      },
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // Handle other common HTTP errors
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
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