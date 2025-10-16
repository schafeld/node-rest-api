require('dotenv').config();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  DEMO_PORT: parseInt(process.env.DEMO_PORT) || 8080,
  
  // API Configuration
  API_VERSION: process.env.API_VERSION || 'v1',
  API_PREFIX: process.env.API_PREFIX || '/api',
  
  // Environment Detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isNetlify: process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
    }
  },
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Authentication
  AUTH: {
    apiKeyRequired: process.env.API_KEY_REQUIRED === 'true',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-me'
  },
  
  // Data Storage
  DATA: {
    filePath: process.env.DATA_FILE_PATH || './data/items.json',
    backupOnStart: process.env.BACKUP_DATA_ON_START === 'true',
    useFileStorage: !process.env.NETLIFY // Use file storage only when not on Netlify
  }
};