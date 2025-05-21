# OpenAI Assistants API Testing Project

This repository demonstrates modern API testing approaches for the OpenAI Assistants API, using a simplified Express server to simulate API responses for testing purposes.

## Project Overview

This project serves as an example of:

1. A Node.js Express API server that simulates the OpenAI Assistants API for testing
2. API testing using Postman collections and Newman CLI runner
3. An OpenAI Assistants API client that demonstrates key interactions including assistant creation, thread management, messaging, and run execution with appropriate error handling
4. Jest-based unit testing with mocks to validate client behavior

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v7 or higher recommended)

### Installation

Install all dependencies:

```bash
npm install
```

## Running the API Server

Start the Express API server:

```bash
npm run start:server
```

The server will run on <http://localhost:3001> and simulates the OpenAI Assistants API.

This server implements:

- A mock Assistant chat endpoint that returns simulated responses
- A health check endpoint

The server serves as a testing harness, allowing you to run API tests without making actual calls to OpenAI's API. All endpoints are tested by the Postman collection located at `tests/postman/api-collection.json`.

## API Endpoints

The API server implements the following endpoints:

### GET /health

Health check endpoint to verify server is running.

**Responses:**

- `200 OK`: Server is running correctly

  ```json
  {
    "status": "ok"
  }
  ```

### POST /assistant/chat

Simple mock endpoint for assistant chat functionality. This endpoint demonstrates how you might implement a chat interface for the OpenAI Assistants API.

**Request Body:**

```json
{
  "message": "Your message here"
}
```

**Responses:**

- `200 OK`: Successfully returned response

  ```json
  {
    "response": "AI response to: \"Your message here\""
  }
  ```

- `400 Bad Request`: Missing message field

  ```json
  {
    "code": 1001,
    "message": "Missing required field: 'message'."
  }
  ```

## API Testing

This project supports two primary approaches to API testing:

### 1. Postman/Newman API Testing

The project includes a Postman collection (`tests/postman/api-collection.json`) and environment (`tests/postman/environment.json`) for testing the API endpoints.

#### Using Newman CLI (Recommended)

1. Make sure the server is running in another terminal window:

   ```bash
   npm run start:server
   ```

2. Run the API tests from the command line:

   ```bash
   npm run test:api
   ```

   Note: The command uses the `--no-experimental-global-webcrypto` Node.js flag to ensure compatibility with Newman v6.2.0 on newer Node.js versions (v22+). This flag prevents Node.js from using the experimental Web Crypto API implementation, which can cause conflicts with Newman's internal dependencies. The command is defined in package.json as:
   
   ```json
   "test:api": "NODE_OPTIONS=\"--no-experimental-global-webcrypto\" newman run tests/postman/api-collection.json -e tests/postman/environment.json"
   ```

### 2. Jest Unit Tests for OpenAI Client

The project includes Jest tests for the OpenAI Assistants API client code.

Run Jest tests with:

```bash
npm test
```

These tests validate the OpenAI Assistants API client functionality without requiring actual API calls (using mocks).

### API Contract Verification

The API contract is specified implicitly through the test cases in the Postman collection. Each test defines the expected request format and response structure, effectively documenting the API contract.

To verify that your implementation matches the expected contract:

1. Run the API server: `npm run start:server`
2. Run the API tests: `npm run test:api`

A successful test run indicates that your API implementation conforms to the expected contract.

For a more structured approach, you can examine the Postman collection (`tests/postman/api-collection.json`) which defines:

- Expected endpoints
- Required parameters
- Response formats
- Validation rules

This provides a simple way to check API contract compliance without additional tools.

## Manual Testing

### Using cURL

#### Health Check

```bash
curl http://localhost:3001/health
```

#### Chat with Assistant

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?"}' \
  http://localhost:3001/assistant/chat
```

## OpenAI Assistants API Setup

This project includes a complete client for interacting with the OpenAI Assistants API. To run the actual client against the real API (not just tests), you will need an OpenAI API key.

### Obtaining an OpenAI API Key

1. Go to the [OpenAI API keys page](https://platform.openai.com/api-keys).
2. Log in or create an account if you don't have one.
3. Click on "+ Create new secret key".
4. Give your key a name (e.g., "api-testing-example") and click "Create secret key".
5. **Important:** Copy the generated API key immediately and store it securely. You will not be able to see it again through the OpenAI website.

### Configuring the API Key

The client code looks for the API key in the following locations, in order:

1. A file at `.secrets/api-keys.js` with the following structure:
   
   ```javascript
   module.exports = {
     OPENAI_API_KEY: 'your_actual_api_key_here'
   };
   ```

2. If the `.secrets` file is not found, it falls back to environment variables.

**Do NOT commit your API key directly into the code or repository.**

For local development:

1. Create the `.secrets` directory in the project root if it doesn't exist
2. Create a file `.secrets/api-keys.js` with your API key
3. Ensure `.secrets` is listed in your `.gitignore` file

### API Testing Best Practices

When writing tests for this API, consider the following best practices:

1. **Organize by Folders**: Group related API endpoints in folders
2. **Use Environment Variables**: Don't hardcode URLs, ports, etc.
3. **Secure API Keys**: Keep API keys in `.secrets` folder, not in environment variables
4. **Pre-request Scripts**: Use them for setup like generating test data (available in `tests/postman/pre-request-script.js`)
5. **Test Scripts**: Validate responses thoroughly (examples in `tests/postman/api-collection.json`)
6. **CI/CD Integration**: Run Newman in your CI/CD pipeline

For more information, refer to:

- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)

## Consumer-Side Testing

While API testing validates that our API implementation meets the expected behavior (provider testing), consumer-side tests verify that client code correctly interacts with the API:

- Tests API client's request formatting and response handling
- Verifies error handling for various API responses
- Ensures proper data transformation between client and API formats
- Uses Jest with mocked API responses to test client behavior in isolation

Run consumer tests with:

```bash
npm test
```

These tests validate the client without requiring the actual API server to be running, using mock responses based on the API contract.

## Scripts

- `npm test` - Run Jest tests for the OpenAI Assistants API client
- `npm run start:server` - Start the mock API server on port 3001
- `npm run test:api` - Run Newman tests against the mock API server

## Dependencies

- Express - Web server framework for the mock API server
- Jest - Testing framework for unit tests
- Newman - Command-line runner for Postman collections
- OpenAI - SDK for interacting with OpenAI's Assistants API
- dotenv - Environment variable management for local development

## License

ISC
