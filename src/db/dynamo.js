const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

// Configure AWS SDK
const dynamoConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// For local development with DynamoDB Local (optional)
if (process.env.DYNAMODB_ENDPOINT) {
  dynamoConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

// Create DynamoDB DocumentClient (easier than raw DynamoDB client)
const dynamoDB = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const tableName = process.env.DYNAMODB_TABLE_NAME || 'todos';

class DynamoDBStore {
  // CREATE: Add a new todo to DynamoDB
  async createTodo(title) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const todo = {
      id,
      title,
      done: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const params = {
      TableName: tableName,
      Item: todo, // DynamoDB stores this as a document
    };

    try {
      await dynamoDB.put(params).promise(); // Write to DynamoDB
      logger.info('Todo created in DynamoDB', { todoId: id, tableName });
      return todo;
    } catch (error) {
      logger.error('Error creating todo in DynamoDB', {
        error: error.message,
        tableName,
      });
      throw error;
    }
  }

  // READ: Get all todos from DynamoDB
  async getTodos() {
    const params = {
      TableName: tableName,
    };

    try {
      const result = await dynamoDB.scan(params).promise(); // Scan entire table
      logger.info('Fetched todos from DynamoDB', {
        count: result.Items.length,
        tableName,
      });
      return result.Items;
    } catch (error) {
      logger.error('Error fetching todos from DynamoDB', {
        error: error.message,
        tableName,
      });
      throw error;
    }
  }

  // READ: Get single todo by ID
  async getTodoById(id) {
    const params = {
      TableName: tableName,
      Key: { id }, // DynamoDB uses 'id' as partition key
    };

    try {
      const result = await dynamoDB.get(params).promise();
      if (!result.Item) {
        logger.warn('Todo not found in DynamoDB', { todoId: id, tableName });
        return null;
      }
      return result.Item;
    } catch (error) {
      logger.error('Error fetching todo from DynamoDB', {
        error: error.message,
        todoId: id,
        tableName,
      });
      throw error;
    }
  }

  // UPDATE: Update a todo in DynamoDB
  async updateTodo(id, updates) {
    const timestamp = new Date().toISOString();

    const params = {
      TableName: tableName,
      Key: { id },
      UpdateExpression: 'set #title = :title, #done = :done, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#done': 'done',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':title': updates.title,
        ':done': updates.done,
        ':updatedAt': timestamp,
      },
      ReturnValues: 'ALL_NEW', // Return updated item
    };

    try {
      const result = await dynamoDB.update(params).promise();
      logger.info('Todo updated in DynamoDB', { todoId: id, tableName });
      return result.Attributes;
    } catch (error) {
      logger.error('Error updating todo in DynamoDB', {
        error: error.message,
        todoId: id,
        tableName,
      });
      throw error;
    }
  }

  // DELETE: Remove a todo from DynamoDB
  async deleteTodo(id) {
    const params = {
      TableName: tableName,
      Key: { id },
    };

    try {
      await dynamoDB.delete(params).promise();
      logger.info('Todo deleted from DynamoDB', { todoId: id, tableName });
      return true;
    } catch (error) {
      logger.error('Error deleting todo from DynamoDB', {
        error: error.message,
        todoId: id,
        tableName,
      });
      throw error;
    }
  }

  // Get total count
  async count() {
    const params = {
      TableName: tableName,
      Select: 'COUNT', // Only count, don't fetch data
    };

    try {
      const result = await dynamoDB.scan(params).promise();
      return result.Count;
    } catch (error) {
      logger.error('Error counting todos in DynamoDB', {
        error: error.message,
        tableName,
      });
      throw error;
    }
  }
}

// Export a single instance
module.exports = new DynamoDBStore();