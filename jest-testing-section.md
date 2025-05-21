# Jest Unit Tests

The project includes two types of Jest test files:

## Mock API Server Tests (`tests/api-server.test.js`)

These tests validate that our mock API server correctly implements the expected API behavior:

- Tests the health check endpoint returns a correct 200 status response
- Verifies the chat endpoint properly handles valid messages and responds with 200 status
- Confirms error handling for invalid inputs (missing message, null values)
- Checks special case handling (empty string messages)
- Validates HTTP 404 responses for non-existent routes
- Tests content type handling and parsing

These tests use native Node.js HTTP client functionality to send requests to an isolated instance of our mock server, ensuring clean test separation and avoiding port conflicts.

Run these tests with:

```bash
npm test tests/api-server.test.js
```

## OpenAI Client Tests (`tests/openai-assistants-example/assistant-client.test.js`)

These tests validate the OpenAI Assistants API client functionality:

- Tests assistant creation and configuration
- Verifies thread management (creation, messaging)
- Validates run execution and polling behavior
- Confirms proper error handling for API failures

These tests use Jest mocks to simulate API responses without requiring actual API calls.

Run all tests with:

```bash
npm test
```
