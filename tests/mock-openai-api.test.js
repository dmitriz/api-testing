// Tests for the mock implementation of the OpenAI Assistants API
// This validates that our mock server correctly implements the expected behavior
const http = require('http');
const app = require('../src/mock-openai-api-server');

/**
 * Utility function to make HTTP requests to a local instance of our server
 * This creates an isolated server instance for each test to avoid port conflicts
 * and ensure clean test state
 * 
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - API endpoint path
 * @param {Object|null} data - Request body data (for POST/PUT)
 * @returns {Promise<Object>} Response with statusCode and body
 */
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    // Create temporary server instance for this test on a random available port
    const server = http.createServer(app);
    // Use port 0 to let the OS assign an available port
    server.listen(0);
    
    server.on('listening', () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port: port,
        path: path,
        method: method,
        headers: {
          'Accept': 'application/json'
        }
      };
      
      if (data) {
        options.headers['Content-Type'] = 'application/json';
      }
      
      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            let parsedBody = null;
            if (responseData) {
              try {
                parsedBody = JSON.parse(responseData);
              } catch (parseError) {
                // For non-JSON responses (like 404 HTML), just store the raw data
                parsedBody = { raw: responseData };
              }
            }
            
            const response = {
              statusCode: res.statusCode,
              body: parsedBody
            };
            server.close();
            resolve(response);
          } catch (e) {
            server.close();
            reject(e);
          }
        });
      });
      
      req.on('error', (e) => {
        server.close();
        reject(e);
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  });
};

/**
 * These tests validate the Mock OpenAI Assistant API endpoints and functionality
 * The mock server simulates the behavior of the actual OpenAI Assistants API
 * without making real API calls, allowing for isolated testing of the expected contract
 */
describe('Mock OpenAI Assistant API', () => {
  /**
   * Health check endpoint tests
   * Validates that the mock server is operational and responding correctly
   * This is a basic endpoint used to verify connectivity and server status
   */
  describe('GET /health', () => {
    it('should return status ok with 200 status code', async () => {
      const response = await makeRequest('GET', '/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  /**
   * Assistant chat endpoint tests
   * These tests validate the primary functionality of the API - handling chat messages
   * Since our server is a mock implementation, we're testing that it correctly follows
   * the contract that would be expected from the real OpenAI Assistant API
   */
  describe('POST /assistant/chat', () => {
    /**
     * Test that sending a valid message returns a 200 response with expected format
     * The mock server should acknowledge the message content in its response
     */
    it('should return a valid response for a proper message', async () => {
      const testMessage = 'Hello, API!';
      const response = await makeRequest('POST', '/assistant/chat', { message: testMessage });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain(testMessage);
    });

    /**
     * Test that the API correctly validates request payloads
     * When no message field is provided, the API should return a 400 error
     * with appropriate error code and message
     */
    it('should return 400 error when message is missing', async () => {
      const response = await makeRequest('POST', '/assistant/chat', {});
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 1001);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Missing required field');
    });

    /**
     * Test that the API correctly handles null values for the message field
     * It should return a 400 error with the appropriate error code
     */
    it('should return 400 error when message is null', async () => {
      const response = await makeRequest('POST', '/assistant/chat', { message: null });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 1001);
    });

    /**
     * Test that the API accepts empty strings as valid messages
     * Unlike null/undefined, empty strings should be treated as valid input
     * and return a successful 200 response with the empty string echoed
     */
    it('should accept empty string as valid message', async () => {
      const response = await makeRequest('POST', '/assistant/chat', { message: '' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain('""');
    });
  });

  // Error handling middleware tests
  describe('Error handling', () => {
    /**
     * Test that the server correctly handles requests to non-existent routes
     * It should return a 404 status code
     */
    it('should return 404 for non-existent routes', async () => {
      const response = await makeRequest('GET', '/non-existent-route');
      
      expect(response.statusCode).toBe(404);
    });
  });

  // Content type validation
  describe('Content type handling', () => {
    /**
     * Test that the API can correctly accept and parse JSON content
     * This verifies the server's ability to process properly formatted JSON requests
     */
    it('should correctly parse JSON content', async () => {
      const response = await makeRequest('POST', '/assistant/chat', { message: 'Testing content type' });
      
      expect(response.statusCode).toBe(200);
    });
  });
});
