const express = require('express');
const itemsRouter = require('./items');

const router = express.Router();

// Mount the items routes
router.use('/items', itemsRouter);

// Stats endpoint at root level
router.get('/stats', require('../controllers/itemController').getStats);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    },
    message: 'Service is healthy'
  });
});

module.exports = router;