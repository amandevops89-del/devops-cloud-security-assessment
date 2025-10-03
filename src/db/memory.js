const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

// In-memory store using JavaScript Map
// Map is like a key-value store (similar to DynamoDB)
const todos = new Map();

class MemoryStore {
  // CREATE: Add a new todo
  async createTodo(title) {
    const id = uuidv4(); // Generate unique ID
    const todo = {
      id,
      title,
      done: false, // Default status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    todos.set(id, todo); // Store in Map
    logger.info('Todo created in memory', { todoId: id });
    return todo;
  }

  // READ: Get all todos
  async getTodos() {
    const allTodos = Array.from(todos.values()); // Convert Map to Array
    logger.info('Fetched todos from memory', { count: allTodos.length });
    return allTodos;
  }

  // READ: Get single todo by ID
  async getTodoById(id) {
    const todo = todos.get(id);
    if (!todo) {
      logger.warn('Todo not found in memory', { todoId: id });
      return null;
    }
    return todo;
  }

  // UPDATE: Update a todo
  async updateTodo(id, updates) {
    const todo = todos.get(id);
    if (!todo) {
      logger.warn('Todo not found for update', { todoId: id });
      return null;
    }

    const updatedTodo = {
      ...todo, // Keep existing fields
      ...updates, // Override with new values
      updatedAt: new Date().toISOString(), // Update timestamp
    };

    todos.set(id, updatedTodo);
    logger.info('Todo updated in memory', { todoId: id });
    return updatedTodo;
  }

  // DELETE: Remove a todo
  async deleteTodo(id) {
    const deleted = todos.delete(id);
    if (deleted) {
      logger.info('Todo deleted from memory', { todoId: id });
    } else {
      logger.warn('Todo not found for deletion', { todoId: id });
    }
    return deleted;
  }

  // Helper for tests - clear all data
  async clear() {
    todos.clear();
    logger.info('Memory store cleared');
  }

  // Get total count
  async count() {
    return todos.size;
  }
}

// Export a single instance (Singleton pattern)
module.exports = new MemoryStore();