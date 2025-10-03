// Load environment variables from .env file
require('dotenv').config();

const app = require('./server');
const logger = require('./logger');

// Get port from environment or use default 3000
const PORT = process.env.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    gitSha: process.env.GIT_SHA || 'unknown',
    database: process.env.USE_MEMORY_STORE === 'true' ? 'memory' : 'dynamodb',
  });
  
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`💚 Health check at http://localhost:${PORT}/healthz`);
  console.log(`📝 API docs at http://localhost:${PORT}/`);
});

// Graceful shutdown handling
// This ensures the server stops cleanly when receiving shutdown signals
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections if needed
    // db.disconnect() etc.
    
    logger.info('Shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
// SIGTERM: Docker/Kubernetes sends this when stopping container
// SIGINT: Ctrl+C in terminal
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason,
    promise,
  });
  process.exit(1);
});