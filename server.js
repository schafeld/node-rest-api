#!/usr/bin/env node

/**
 * Production-ready Node.js REST API Server
 * Built with Express.js, comprehensive validation, security, and logging
 */

const app = require('./src/app');
const config = require('./src/config/environment');
const logger = require('./src/utils/logger');
const dataService = require('./src/services/dataService');

async function startServer() {
  try {
    // Initialize data service
    logger.info('Initializing data service...');
    await dataService.initialize();
    
    // Start HTTP server
    const server = app.listen(config.PORT, () => {
      logger.info('🚀 Server started successfully', {
        port: config.PORT,
        environment: config.NODE_ENV,
        apiVersion: config.API_VERSION,
        dataMode: config.DATA.useFileStorage ? 'file-storage' : 'in-memory'
      });
      
      console.log('');
      console.log('📊 Server Information:');
      console.log(`   🌐 Server: http://localhost:${config.PORT}`);
      console.log(`   📡 API Base: http://localhost:${config.PORT}${config.API_PREFIX}/${config.API_VERSION}`);
      console.log(`   🏥 Health Check: http://localhost:${config.PORT}/health`);
      console.log(`   📚 Demo App: http://localhost:${config.DEMO_PORT} (if running)`);
      console.log('');
      console.log('🔗 Available API Endpoints:');
      console.log(`   GET    ${config.API_PREFIX}/${config.API_VERSION}/items - Get all items`);
      console.log(`   GET    ${config.API_PREFIX}/${config.API_VERSION}/items/:id - Get item by ID`);
      console.log(`   POST   ${config.API_PREFIX}/${config.API_VERSION}/items - Create new item`);
      console.log(`   PUT    ${config.API_PREFIX}/${config.API_VERSION}/items/:id - Update item`);
      console.log(`   DELETE ${config.API_PREFIX}/${config.API_VERSION}/items/:id - Delete item`);
      console.log(`   POST   ${config.API_PREFIX}/${config.API_VERSION}/items/reset - Reset to default data`);
      console.log(`   GET    ${config.API_PREFIX}/${config.API_VERSION}/stats - Get statistics`);
      console.log('');
      
      if (config.isDevelopment) {
        console.log('💡 Development Tips:');
        console.log('   • Data persists to ./data/items.json');
        console.log('   • Logs are written to ./logs/ directory');
        console.log('   • Use npm run dev for auto-restart with nodemon');
        console.log('   • Use npm test to run the test suite');
        console.log('');
      }
      
      if (config.isNetlify) {
        console.log('☁️  Netlify Mode:');
        console.log('   • Using in-memory storage (no file persistence)');
        console.log('   • Data resets on each deployment');
        console.log('');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received, initiating graceful shutdown`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown', { error: err.message });
          process.exit(1);
        }
        
        logger.info('✅ Server shut down successfully');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('❌ Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server', { 
      error: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;