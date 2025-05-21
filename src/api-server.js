const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Assistant chat endpoint - simulates a response from OpenAI Assistants API
app.post('/assistant/chat', (req, res) => {
  const { message } = req.body;
  // Allow empty strings to pass, but reject null/undefined
  if (message === undefined || message === null) {
    return res.status(400).json({
      code: 1001,
      message: "Missing required field: 'message'."
    });
  }
  
  // Simple mock response that simulates an AI assistant response
  res.status(200).json({
    response: `AI response to: "${message}"`
  });
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
        console.log(`API Server listening at http://localhost:${port}`);
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
