const express = require('express');
const logger = require('../logger');
const { todosCreatedTotal, todosTotal } = require('../metrics');

// Dynamic database selection based on environment
// If USE_MEMORY_STORE=true, use in-memory store, else use DynamoDB
const db = process.env.USE_MEMORY_STORE === 'true'
  ? require('../db/memory')
  : require('../db/dynamo');

const router = express.Router();

// GET /api/v1/todos - List all todos
router.get('/', async (req, res) => {
  try {
    logger.info('GET /api/v1/todos - Fetching all todos');
    
    // Fetch todos from database
    const todos = await db.getTodos();
    
    // Update metrics
    todosTotal.set(todos.length);
    
    logger.info('Successfully fetched todos', { count: todos.length });
    
    // Return response
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    logger.error('Error fetching todos', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch todos',
      message: error.message,
    });
  }
});

// POST /api/v1/todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    
    // Validation: Check if title is provided
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      logger.warn('POST /api/v1/todos - Invalid request: missing or empty title');
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Title is required and must be a non-empty string',
      });
    }
    
    // Validation: Check title length (max 200 characters)
    if (title.length > 200) {
      logger.warn('POST /api/v1/todos - Invalid request: title too long');
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Title must not exceed 200 characters',
      });
    }
    
    logger.info('POST /api/v1/todos - Creating new todo', { title });
    
    // Create todo in database
    const newTodo = await db.createTodo(title.trim());
    
    // Update metrics
    todosCreatedTotal.inc(); // Increment counter
    const currentCount = await db.count();
    todosTotal.set(currentCount); // Update gauge
    
    logger.info('Successfully created todo', { todoId: newTodo.id });
    
    // Return response with 201 Created status
    res.status(201).json({
      success: true,
      data: newTodo,
    });
  } catch (error) {
    logger.error('Error creating todo', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to create todo',
      message: error.message,
    });
  }
});

// Export router to use in server.js
module.exports = router;