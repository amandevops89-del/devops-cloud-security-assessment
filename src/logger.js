const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Log level: info, warn, error, debug
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to each log
    winston.format.errors({ stack: true }), // Include stack trace for errors
    winston.format.json(), // Output logs in JSON format (for CloudWatch, ELK)
  ),
  defaultMeta: {
    service: 'todo-api',
    environment: process.env.NODE_ENV || 'development',
    commit: process.env.GIT_SHA || 'unknown', // Git commit SHA for traceability
  },
  transports: [
    // Console transport - logs to stdout
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Color-coded logs for readability
        winston.format.simple(), // Simple format for development
      ),
    }),
  ],
});

// Export logger to use in other files
module.exports = logger;