// tests/api-server.test.js
const request = require('supertest');
const app = require('../src/api-server');

// These tests validate the API server endpoints and functionality
describe('API Server', () => {
  // Health check endpoint tests
  describe('GET /health', () => {
    it('should return status ok with 200 status code', async () => {
      const response = await request(app).get('/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  // Assistant chat endpoint tests
  describe('POST /assistant/chat', () => {
    it('should return a valid response for a proper message', async () => {
      const testMessage = 'Hello, API!';
      const response = await request(app)
        .post('/assistant/chat')
        .send({ message: testMessage })
        .set('Accept', 'application/json');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain(testMessage);
    });

    it('should return 400 error when message is missing', async () => {
      const response = await request(app)
        .post('/assistant/chat')
        .send({}) // Empty request body - no message
        .set('Accept', 'application/json');
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 1001);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Missing required field');
    });

    it('should handle null message value', async () => {
      const response = await request(app)
        .post('/assistant/chat')
        .send({ message: null })
        .set('Accept', 'application/json');
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('should handle empty string message value', async () => {
      const response = await request(app)
        .post('/assistant/chat')
        .send({ message: '' })
        .set('Accept', 'application/json');
      
      // Server should respond successfully even for empty strings
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain('""');
    });
  });

  // Error handling middleware tests
  describe('Error handling', () => {
    it('should handle unexpected errors with proper error format', async () => {
      // Create a temporary error route to test error handling middleware
      app.get('/test-error', (req, res, next) => {
        // Trigger a deliberate error
        next(new Error('Test error'));
      });

      const response = await request(app)
        .get('/test-error');
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('code', 5000);
      expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route');
      
      expect(response.statusCode).toBe(404);
    });
  });

  // Content type validation
  describe('Content type handling', () => {
    it('should correctly parse JSON content', async () => {
      const response = await request(app)
        .post('/assistant/chat')
        .set('Content-Type', 'application/json')
        .send({ message: 'Testing content type' });
      
      expect(response.statusCode).toBe(200);
    });

    it('should reject invalid JSON', async () => {
      const response = await request(app)
        .post('/assistant/chat')
        .set('Content-Type', 'application/json')
        // Send malformed JSON by sending a string directly
        .send('{ message: This is not valid JSON }');
      
      // Express JSON parser middleware should return 400 for bad JSON
      expect(response.statusCode).toBe(400);
    });
  });
});
