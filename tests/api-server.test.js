const http = require('http');
const app = require('../src/api-server');

// Simple function to make HTTP requests to our server
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    // Create server instance for this test
    const server = http.createServer(app);
    server.listen(0); // Use any available port
    
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

// Create a test version of the API server
describe('API Server', () => {
  // Health check endpoint tests
  describe('GET /health', () => {
    it('should return status ok with 200 status code', async () => {
      const response = await makeRequest('GET', '/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  // Assistant chat endpoint tests
  describe('POST /assistant/chat', () => {
    it('should return a valid response for a proper message', async () => {
      const testMessage = 'Hello, API!';
      const response = await makeRequest('POST', '/assistant/chat', { message: testMessage });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain(testMessage);
    });

    it('should return 400 error when message is missing', async () => {
      const response = await makeRequest('POST', '/assistant/chat', {});
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 1001);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Missing required field');
    });

    it('should handle null message value', async () => {
      const response = await makeRequest('POST', '/assistant/chat', { message: null });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('should handle empty string message value', async () => {
      const response = await makeRequest('POST', '/assistant/chat', { message: '' });
      
      // Server should respond successfully even for empty strings
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain('""');
    });
  });

  // Error handling middleware tests
  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await makeRequest('GET', '/non-existent-route');
      
      expect(response.statusCode).toBe(404);
    });
  });

  // Content type validation
  describe('Content type handling', () => {
    it('should correctly parse JSON content', async () => {
      const response = await makeRequest('POST', '/assistant/chat', { message: 'Testing content type' });
      
      expect(response.statusCode).toBe(200);
    });
  });
});
