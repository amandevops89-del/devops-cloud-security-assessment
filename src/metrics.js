const client = require('prom-client');

// Create a Registry to register all metrics
const register = new client.Registry();

// Collect default metrics (CPU, memory, event loop lag, etc.)
// Prometheus automatically collects these system metrics
client.collectDefaultMetrics({ register });

// Custom Metric 1: HTTP Request Duration (Histogram)
// Tracks how long each request takes
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'], // Labels for filtering
  buckets: [0.1, 0.5, 1, 2, 5], // Time buckets in seconds
});

// Custom Metric 2: HTTP Request Counter
// Counts total number of requests
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Custom Metric 3: Todos Created Counter
// Tracks how many todos are created
const todosCreatedTotal = new client.Counter({
  name: 'todos_created_total',
  help: 'Total number of todos created',
});

// Custom Metric 4: Total Todos Gauge
// Shows current total number of todos
const todosTotal = new client.Gauge({
  name: 'todos_total',
  help: 'Current total number of todos in the system',
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(todosCreatedTotal);
register.registerMetric(todosTotal);

// Export metrics for use in other files
module.exports = {
  register, // Main registry for /metrics endpoint
  httpRequestDuration,
  httpRequestTotal,
  todosCreatedTotal,
  todosTotal,
};