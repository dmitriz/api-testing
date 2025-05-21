# API Testing Project with OpenAI Assistants

This repository demonstrates modern API testing approaches using Express server implementation and the OpenAI Assistants API. It provides examples of testing both a custom REST API and the OpenAI Assistants API.

## Project Overview

This project serves as an example of:

1. A Node.js Express API server that implements user profile and assistant chat endpoints
2. API testing using Postman collections and Newman
3. In-memory data storage for demonstration purposes
4. OpenAI Assistants API integration with a complete client implementation
5. Jest-based unit testing of the OpenAI Assistants client

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v7 or higher recommended)

### Installation

Install all dependencies:

```bash
npm install
```

## Project Structure

The project is organized as follows:

```text
├── src/                        # Source code
│   ├── api-server.js           # Express API server implementation 
│   └── openai-assistants-example/
│       └── assistant-client.js # OpenAI Assistants API client
├── tests/
│   ├── openai-assistants-example/
│   │   └── assistant-client.test.js # Jest tests for the OpenAI client
│   └── postman/                # Postman-based API testing
│       ├── api-collection.json # Postman collection for API testing
│       ├── environment.json    # Environment variables for Postman
│       ├── pre-request-script.js # Pre-request scripts for Postman tests
│       └── test-helpers.js     # Helper functions for Postman tests
└── .secrets/                   # Directory for API keys (not in repo)
    └── api-keys.js             # API keys configuration file
```

## Running the API Server

Start the Express API server:

```bash
npm run start:server
```

The server will run on <http://localhost:3001> and will display the available user IDs and endpoints.

This server implements:

- REST API endpoints for user profile management
- A simple assistant chat endpoint that returns mock responses
- A health check endpoint

All these endpoints are tested by the Postman collection located at `tests/postman/api-collection.json`.

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

### GET /v1/users/:userId/profile

Get a user's profile information.

**Path Parameters:**

- `userId` (string): UUID of the user (see available test users below)

**Responses:**

- `200 OK`: Successfully returned user profile

  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "test.user.A@example.com",
    "displayName": "Test User A (from spec example)"
  }
  ```

- `400 Bad Request`: Invalid userId format
- `404 Not Found`: User not found

### PUT /v1/users/:userId/profile

Update a user's profile information.

**Path Parameters:**

- `userId` (string): UUID of the user

**Request Body:**

```json
{
  "email": "new.email@example.com", 
  "displayName": "New Display Name" // optional
}
```

**Responses:**

- `200 OK`: Successfully updated user profile

  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "email": "new.email@example.com",
    "displayName": "New Display Name"
  }
  ```

- `400 Bad Request`: Invalid userId format, missing email, or invalid email format
- `404 Not Found`: User not found

### Available Test Users

The server comes pre-configured with the following test users:

| User ID | Email | Display Name |
|---------|-------|--------------|
| a1b2c3d4-e5f6-7890-1234-567890abcdef | `test.user.A@example.com` | Test User A (from spec example) |
| b2c3d4e5-f6a7-8901-2345-67890abcdef1 | `test.user.B@example.com` | Test User B (from spec example) |
| f4a7b8c9-d0e1-2345-6789-0abcdef12345 | `original.get.user@example.com` | Original GET User |

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

   Note: The command uses the `--no-experimental-global-webcrypto` Node.js flag to ensure compatibility with Newman v6.2.0 on newer Node.js versions (v22+). The command is defined in package.json as:
   
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

#### Using Postman GUI (Alternative method)

If you prefer using the Postman GUI instead of Newman CLI:

1. Import the collection and environment files into Postman:
   
   - Open Postman desktop app
   - Click on "Import" button in the top left
   - Select the `tests/postman/api-collection.json` file
   - Import the `tests/postman/environment.json` environment
   
   > **Important**: API keys are managed server-side from `.secrets/api-keys.js` and are not exposed to Postman

2. Make sure your server is running:

   ```bash
   npm run start:server
   ```

3. Run the collection from Postman GUI to test your API endpoints:
   
   - Select the collection in the sidebar
   - Click the "Run" button at the top right
   - Configure run settings (iterations, delays, etc.)
   - Click the "Run" button to execute tests

### Understanding and Writing API Tests

#### How the Postman Tests Work

The tests in this project use Postman's testing framework, which is based on JavaScript and provides special objects like `pm` (Postman) to interact with requests and responses.

The test files are located at:

- Postman Collection: `tests/postman/api-collection.json`
- Environment: `tests/postman/environment.json`
- Helper functions: `tests/postman/test-helpers.js` 
- Pre-request scripts: `tests/postman/pre-request-script.js`

#### Adding New API Tests

There are two approaches to adding new tests:

1. **Using Postman UI** (requires Postman desktop app)
   - Open the collection in Postman
   - Create a new request with appropriate HTTP method, URL, and body
   - Click on the "Tests" tab in the request panel
   - Add JavaScript test code in the "Tests" tab editor

2. **Directly editing the collection JSON** (recommended for version control)
   - Edit `tests/postman/api-collection.json`
   - Add a new item to the collection with test scripts

#### Test Script Examples

Here's an example of a simple test script that verifies a 200 status code and checks that the response contains expected data:

```javascript
// Check status code
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

// Verify response structure and content
pm.test("Response contains expected data", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.expect(jsonData.email).to.be.a('string');
});

// Validate against a schema (if applicable)
const schema = {
    "type": "object",
    "required": ["id", "email", "displayName"],
    "properties": {
        "id": { "type": "string" },
        "email": { "type": "string" },
        "displayName": { "type": "string" }
    }
};

pm.test("Response matches schema", function() {
    pm.response.to.have.jsonSchema(schema);
});
```

#### Using Helper Functions

The project includes helper functions in `tests/postman/test-helpers.js` that can be used in your test scripts:

```javascript
// Load helper functions from the collection-level variables
// These functions are defined in tests/postman/test-helpers.js
eval(pm.globals.get('validateContentType'));
eval(pm.globals.get('checkResponseTime'));

// Use helper functions in your tests
validateContentType('application/json');
checkResponseTime(500); // Fails if response takes more than 500ms
```

> **Note**: The `pm` object is specific to the Postman/Newman environment and is not available in standard JavaScript or Node.js environments. These tests must run within Postman or Newman.

## Manual Testing

### Using cURL

#### GET a user profile

```bash
curl http://localhost:3001/v1/users/a1b2c3d4-e5f6-7890-1234-567890abcdef/profile
```

#### PUT (update) a user profile

```bash
curl -X PUT -H "Content-Type: application/json" \
  -d '{"email":"new.email@example.com", "displayName":"Updated Name A"}' \
  http://localhost:3001/v1/users/a1b2c3d4-e5f6-7890-1234-567890abcdef/profile
```

## OpenAI Assistants API Example Setup

This project includes an example of interacting with the OpenAI Assistants API. To run this example, you will need an OpenAI API key.

### Obtaining an OpenAI API Key

1. Go to the [OpenAI API keys page](https://platform.openai.com/api-keys).
2. Log in or create an account if you don't have one.
3. Click on "+ Create new secret key".
4. Give your key a name (e.g., "api-testing-example") and click "Create secret key".
5. **Important:** Copy the generated API key immediately and store it securely. You will not be able to see it again through the OpenAI website.

### Configuring the API Key

The example code expects the API key to be available as an environment variable named `OPENAI_API_KEY`.

**Do NOT commit your API key directly into the code or repository.**

You can set up the environment variable in one of the following ways:

- **Temporarily in your terminal session:**
    Before running the application or tests that use the OpenAI API, execute this in your terminal:

    ```bash
    export OPENAI_API_KEY='your_actual_api_key_here'
    ```

    (On Windows, use `set OPENAI_API_KEY=your_actual_api_key_here`)
    This variable will only be set for the current terminal session.

- **Using a `.env` file (Recommended for local development):**
    1. Create a file named `.env` in the root directory of this project.
    2. Add the following line to the `.env` file, replacing `your_actual_api_key_here` with your actual key:

        ```env
        OPENAI_API_KEY='your_actual_api_key_here'
        ```

    3. Ensure that `.env` is listed in your `.gitignore` file to prevent it from being committed to Git.
    4. You will need a library like `dotenv` to load this file in your application code if you run scripts directly. Jest typically has ways to load `.env` files as well, or you might source it before running tests. For simplicity in the initial example, we'll assume the environment variable is set directly or use `dotenv` in the client code.

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

- `npm test` - Run Jest tests for consumer-side code
- `npm run start:server` - Start the API server
- `npm run test:api` - Run Newman tests against the API

## Dependencies

- Express - Web server framework for the API
- Jest - Testing framework for unit tests
- Newman - Command-line runner for Postman collections
- OpenAI - SDK for interacting with OpenAI's APIs
- dotenv - Environment variable management

## License

ISC
