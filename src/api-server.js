const express = require('express');
const app = express();
const port = 3000;

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
  const user = users[userId];

  if (user) {
    res.status(200).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });
  } else {
    res.status(404).json({
      code: 40401,
      message: 'User not found.',
    });
  }
});

app.put('/v1/users/:userId/profile', (req, res) => {
  const { userId } = req.params;
  const { email, displayName } = req.body;

  if (!users[userId]) {
    return res.status(404).json({
      code: 40401,
      message: 'User not found. Cannot update.',
    });
  }

  if (!email) {
    return res.status(400).json({
      code: 1001,
      message: "Invalid input: 'email' is a required field in the request body.",
    });
  }
  if (typeof email !== 'string') {
     return res.status(400).json({
         code: 1002,
         message: "Invalid input: 'email' must be a string.",
     });
  }

  users[userId].email = email;
  if (displayName !== undefined) {
    users[userId].displayName = displayName;
  }

  res.status(200).json({
    message: 'Profile updated successfully.',
  });
});

app.get('/', (req, res) => {
     res.send('API Server is running. Refer to api-spec.yaml for endpoints.');
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
