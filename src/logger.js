const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', 
  format: winston.format.combine(
    winston.format.timestamp(), 
    winston.format.errors({ stack: true }), 
    winston.format.json(), 
  ),
  defaultMeta: {
    service: 'todo-api',
    environment: process.env.NODE_ENV || 'development',
    commit: process.env.GIT_SHA || 'unknown', 
  },
  transports: [
    // Console transport - logs to stdout
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), 
        winston.format.simple(), 
      ),
    }),
  ],
});

// Export logger to use in other files
module.exports = logger;