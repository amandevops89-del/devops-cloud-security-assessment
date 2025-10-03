const request = require('supertest');
const app = require('../src/server');

// Test suite for API endpoints
describe('Todo API Tests', () => {
  
  // Test 1: Health check endpoint
  describe('GET /healthz', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);
      
      // Check response structure
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('commit');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });
  
  // Test 2: Metrics endpoint
  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      // Check that metrics are returned as text
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('http_request_duration_seconds');
    });
  });
  
  // Test 3: Root endpoint
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('endpoints');
    });
  });
  
  // Test 4: Get all todos (initially empty)
  describe('GET /api/v1/todos', () => {
    it('should return empty list initially', async () => {
      const response = await request(app)
        .get('/api/v1/todos')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  // Test 5: Create a new todo (happy path)
  describe('POST /api/v1/todos', () => {
    it('should create a new todo successfully', async () => {
      const newTodo = {
        title: 'Test todo item',
      };
      
      const response = await request(app)
        .post('/api/v1/todos')
        .send(newTodo)
        .expect(201);
      
      // Check response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', newTodo.title);
      expect(response.body.data).toHaveProperty('done', false);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });
    
    // Test 6: Validation - missing title
    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/v1/todos')
        .send({}) // Empty body
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.message).toContain('Title is required');
    });
    
    // Test 7: Validation - empty title
    it('should return 400 if title is empty string', async () => {
      const response = await request(app)
        .post('/api/v1/todos')
        .send({ title: '   ' }) // Only whitespace
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
    
    // Test 8: Validation - title too long
    it('should return 400 if title exceeds 200 characters', async () => {
      const longTitle = 'a'.repeat(201); // 201 characters
      
      const response = await request(app)
        .post('/api/v1/todos')
        .send({ title: longTitle })
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('200 characters');
    });
  });
  
  // Test 9: Integration test - create and list
  describe('POST then GET /api/v1/todos', () => {
    it('should create todo and then retrieve it in list', async () => {
      // Step 1: Create a todo
      const newTodo = { title: 'Integration test todo' };
      const createResponse = await request(app)
        .post('/api/v1/todos')
        .send(newTodo)
        .expect(201);
      
      const createdId = createResponse.body.data.id;
      
      // Step 2: Get all todos
      const listResponse = await request(app)
        .get('/api/v1/todos')
        .expect(200);
      
      // Verify the created todo is in the list
      const foundTodo = listResponse.body.data.find(todo => todo.id === createdId);
      expect(foundTodo).toBeDefined();
      expect(foundTodo.title).toBe(newTodo.title);
    });
  });
  
  // Test 10: 404 for unknown routes
  describe('GET /unknown-route', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});