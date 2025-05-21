const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const users = {
  'a1b2c3d4-e5f6-7890-1234-567890abcdef': {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'test.user.A@example.com',
    displayName: 'Test User A (from spec example)',
  },
  'b2c3d4e5-f6a7-8901-2345-67890abcdef1': {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    email: 'test.user.B@example.com',
    displayName: 'Test User B (from spec example)',
  },
  'f4a7b8c9-d0e1-2345-6789-0abcdef12345': {
    id: 'f4a7b8c9-d0e1-2345-6789-0abcdef12345',
    email: 'original.get.user@example.com',
    displayName: 'Original GET User',
  }
};

app.get('/v1/users/:userId/profile', (req, res) => {
  const { userId } = req.params;

  // Validate userId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({
      code: 1000,
      message: "Invalid userId format. Must be a valid UUID.",
    });
  }

  const user = users[userId];

  if (user) {
    res.status(200).json({
      id: user.id,
      email: user.email,
      app.put('/v1/users/:userId/profile', (req, res) => {
        const { userId } = req.params;
        const { email, displayName } = req.body;
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    res.status(404).json({
      code: 40401,
      message: 'User not found.',
    });
  }
});
app.put('/v1/users/:userId/profile', (req, res) => {
  const { userId } = req.params;
  const { email, displayName } = req.body;

  // Validate userId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({
      code: 1000,
      message: "Invalid userId format. Must be a valid UUID.",
    });
  }

  if (!users[userId]) {
    return res.status(404).json({
      code: 40401,
      message: 'User not found. Cannot update.',
    });
  }
  if (!email) {
    return res.status(400).json({
      code: 1001,
      message: "Missing required field: 'email'.",
    });
  }
  
  if (typeof email !== 'string') {
    return res.status(400).json({
      code: 1002,
      message: "Field 'email' must be a string."
    });
  }

  users[userId].email = email;
  users[userId].email = email;
  if (displayName !== undefined) {
    if (typeof displayName === 'string') {
      users[userId].displayName = displayName;
    } else {
      // Optional: return a 400 error if displayName is provided but not a string
      // Or, simply ignore non-string displayName updates silently
      // For now, let's assume we only update if it's a string
      console.warn(`Invalid type for displayName for user ${userId}. Expected string.`);
    }
  }

  res.status(200).json({
    message: 'Profile updated successfully.',
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
     app.listen(port, () => {
         console.log(`API Server listening at http://localhost:${port}`);
         console.log('Available user IDs for testing:');
         Object.keys(users).forEach(id => console.log(`- ${id}`));
         console.log('Endpoints:');
         console.log(`  GET /v1/users/:userId/profile`);
         console.log(`  PUT /v1/users/:userId/profile`);
     });
}

module.exports = app;
