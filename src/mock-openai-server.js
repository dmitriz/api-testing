/**
 * Mock OpenAI Assistants API Server
 * 
 * This Express server simulates the behavior of the OpenAI Assistants API
 * for testing purposes. It implements a subset of the API endpoints with
 * predictable mock responses.
 */
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Assistant chat endpoint
app.post('/assistant/chat', (req, res) => {
  // Validate that message exists and isn't null
  if (!req.body.hasOwnProperty('message')) {
    return res.status(400).json({
      code: 1001,
      message: 'Missing required field: message'
    });
  }
  
  if (req.body.message === null) {
    return res.status(400).json({
      code: 1001,
      message: 'Field cannot be null: message'
    });
  }
  
  // Generate mock response
  const userMessage = req.body.message;
  return res.status(200).json({
    response: `I received your message: "${userMessage}"`
  });
});

// Handle malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      code: 1002,
      message: 'Malformed JSON in request body.'
    });
  }
  next(err);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 5000,
    message: 'An unexpected error occurred'
  });
});

if (require.main === module) {
    const server = app.listen(port, () => {
        console.log(`Mock OpenAI API Server listening at http://localhost:${port}`);
        console.log('Endpoints:');
        console.log(`  GET /health`);
        console.log(`  POST /assistant/chat`);
    }).on('error', (err) => {
        console.error(`Failed to start server: ${err.message}`);
        process.exit(1); // PM2 will handle the restart
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Gracefully shutting down server...');
        server.close(() => {
            console.log('Server shut down successfully');
            process.exit(0);
        });
    });
}

module.exports = app;
