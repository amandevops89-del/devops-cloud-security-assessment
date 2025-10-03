const express = require('express');
const logger = require('./logger');
const { register, httpRequestDuration, httpRequestTotal } = require('./metrics');
const todosRouter = require('./routes/todos');

// Create Express app
const app = express();

// Middleware 1: JSON body parser
// Converts incoming JSON requests to JavaScript objects
app.use(express.json());

// Middleware 2: Request logging
// Logs every incoming request
app.use((req, res, next) => {
  const startTime = Date.now();
  
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}s`,
    });
    
    // Update Prometheus metrics
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  
  next();
});

// Route 1: Health check endpoint
// Used by Kubernetes liveness/readiness probes and load balancers
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    commit: process.env.GIT_SHA || 'unknown',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Route 2: Metrics endpoint for Prometheus
// Exposes all metrics collected by prom-client
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics', { error: error.message });
    res.status(500).end(error.message);
  }
});

// Route 3: Todos API routes
// Mount all /api/v1/todos routes from todos.js
app.use('/api/v1/todos', todosRouter);

// Route 4: Root endpoint (API info)
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Todo API',
    version: '1.0.0',
    description: 'DevOps & Cloud Security Assessment API',
    endpoints: {
      health: '/healthz',
      metrics: '/metrics',
      todos: '/api/v1/todos',
    },
  });
});

// Middleware 3: 404 handler
// Handles requests to non-existent routes
app.use((req, res) => {
  logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Middleware 4: Global error handler
// Catches any unhandled errors in the application
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Export app for testing and index.js
module.exports = app;