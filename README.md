# OpenAI Assistants API Testing Project

This repository demonstrates modern API testing approaches for the OpenAI Assistants API, using a simplified Express server to simulate API responses for testing purposes.

## Project Overview

This project serves as an example of:

- A Node.js Express API server that acts as a mock implementation of the OpenAI Assistants API for testing purposes
- API testing using Postman collections and Newman CLI runner to validate API contract conformance
- An OpenAI Assistants API client that demonstrates key interactions including assistant creation, thread management, messaging, and run execution with appropriate error handling
- Jest-based unit testing that verifies both the mock server behavior and client functionality

## Getting Started

### Prerequisites

- Node.js (v22 or higher recommended)
- npm (v9 or higher recommended)

### Installation

Install all dependencies:

```bash
npm install
```

## Running the API Server

Start the Express API server using PM2 process manager:

```bash
npm start
```

The server will run on <http://localhost:3001> and simulates the OpenAI Assistants API.

### PM2 Commands

The project uses PM2 to manage the API server process. Here are the available commands:

- **Start server**: `npm start` - Launches the API server using PM2 with settings from ecosystem.config.js
- **Stop server**: `npm run stop` - Stops the running API server instance
- **Restart server**: `npm run restart` - Restarts the API server (useful after code changes)
- **Check server status**: `npm run status` - Displays current PM2 processes and their status
- **View server logs**: `npm run logs` - Shows real-time application logs for debugging
- **Remove server from PM2**: `npm run delete` - Completely removes the server from PM2 management

### PM2 Configuration Details

The `ecosystem.config.js` file contains important PM2 configuration settings:

- **Basic Configuration**:
  - `name`: "api-server" - Identifier for the process in PM2
  - `script`: "src/api-server.js" - Main application entry point
  - `script`: "src/mock-openai-api-server.js" - Main application entry point
- `instances`: 1 - Number of instances (no clustering in this setup)

- **Restart Behavior**:
  - `autorestart`: true - Automatically restarts if the app crashes
  - `watch`: false - Does not watch for file changes to restart

- **Memory Management**:
  - `max_memory_restart`: "200M" - Restarts if memory usage exceeds this value

- **Environment Variables**:
  - Development and production environments with appropriate NODE_ENV settings

- **Process Management**:
  - `kill_timeout`: 3000ms - Time to wait before forcing process termination
  - `restart_delay`: 1000ms - Wait time between auto-restarts
  - `exp_backoff_restart_delay`: 100ms - Starting delay for exponential backoff

PM2 Benefits:

- Automatically restarts the server if it crashes
- Handles port conflicts gracefully
- Provides process monitoring and management
- Maintains logs for debugging

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

- Make sure the server is running in another terminal window:

   ```bash
   npm run start
   ```

- Run the API tests from the command line:

   ```bash
   npm run test:api
   ```

### Newman Compatibility with Node.js v22+

Running Newman with newer Node.js versions (v22+) presents compatibility challenges due to changes in the JavaScript runtime. This project includes a custom solution to address these issues.

#### Background on the Issues

Newman v6.2.1 (and many of its dependencies, particularly the `colors` package) encounters several problems when running in Node.js v22+:

1. **Missing `global` Object**: Node.js v22+ doesn't define the `global` object the same way older versions did, causing "global is not defined" errors.

2. **Prototype Access Restrictions**: Node.js v22+ restricts access to `Object.prototype.__proto__` when running with `--disable-proto=throw`, which breaks the `colors` package used by Newman.

3. **Web Crypto API Conflicts**: The experimental Web Crypto API in Node.js v22+ conflicts with some of Newman's dependencies.

#### Solution Implementation

The project includes a robust bash script wrapper (`tests/postman/run-newman.sh`) that tries multiple approaches to run Newman successfully:

```bash
#!/bin/bash

# This script provides workarounds for running Newman with recent Node.js versions
# It attempts several methods to run Newman successfully

echo "Running Newman compatibility script..."

# Method 0: Try using NVM with Node.js v18 (known to work well with Newman)
if command -v nvm &>/dev/null; then
    echo "NVM detected. Trying Method 0: Running with Node.js v18..."
    nvm use 18 &>/dev/null || nvm exec 18 npx newman run "$@"
    
    if [ $? -eq 0 ]; then
        echo "Newman tests completed successfully with Node.js v18"
        exit 0
    else
        echo "Method 0 failed. Falling back to other methods..."
    fi
fi

# Method 1: Try using npx with specific Node.js options
echo "Trying Method 1: npx with Node.js options..."
export NODE_OPTIONS="--no-experimental-fetch --no-experimental-global-webcrypto"
npx --yes newman run "$@"

# If the above fails, try the next method
if [ $? -ne 0 ]; then
    echo "Method 1 failed. Trying Method 2: direct polyfill..."
    
    # Create a temporary script with polyfills
    TEMP_SCRIPT=$(mktemp)
    
    cat > "$TEMP_SCRIPT" << 'EOL'
// Polyfill global for Node.js v22+
if (typeof global === 'undefined') {
  global = globalThis;
}

// Find and load the Newman module
try {
  const path = require('path');
  const fs = require('fs');
  
  const projectRoot = path.resolve(__dirname, '..', '..');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  
  if (fs.existsSync(path.join(nodeModulesPath, 'newman'))) {
    // Load newman CLI from local node_modules
    require(path.join(nodeModulesPath, 'newman/bin/newman.js'));
  } else {
    console.error('Newman not found in node_modules. Please install it first with: npm install newman');
    process.exit(1);
  }
} catch (error) {
  console.error('Error loading newman:', error.message);
  process.exit(1);
}
EOL
    
    # Run the script with the arguments
    echo "Running with custom Newman wrapper..."
    node "$TEMP_SCRIPT" run "$@"
    RESULT=$?
    
    # Clean up
    rm "$TEMP_SCRIPT"
    
    exit $RESULT
fi
```

#### How the Script Works

The script tries three different methods in sequence:

1. **Method 0 - NVM with Node.js v18**:
   - If NVM (Node Version Manager) is available, it attempts to run Newman with Node.js v18
   - This is the most reliable approach because Node.js v18 is fully compatible with Newman

2. **Method 1 - Node.js Options**:
   - Uses specific Node.js options (`--no-experimental-fetch --no-experimental-global-webcrypto`)
   - These flags disable features in newer Node.js versions that conflict with Newman

3. **Method 2 - JavaScript Polyfill**:
   - Creates a temporary JavaScript file that polyfills the `global` object
   - The script then requires the local Newman installation directly
   - This bypasses issues with missing global objects and prototype access restrictions

#### Alternative JavaScript Runner

The project also includes a pure JavaScript solution (`tests/postman/run-newman.js`) that can be used as another option:

```javascript
/**
 * Custom Newman runner script
 * 
 * This script provides a workaround for Node.js compatibility issues with Newman.
 * It runs Newman programmatically with the right configuration to avoid
 * "global is not defined" errors in newer Node.js versions.
 */

const newman = require('newman');
const path = require('path');
const fs = require('fs');

// Get absolute paths to the collection and environment files
const collectionPath = path.resolve(__dirname, 'api-collection.json');
const environmentPath = path.resolve(__dirname, 'environment.json');

// Verify files exist
if (!fs.existsSync(collectionPath)) {
  console.error(`Collection file not found: ${collectionPath}`);
  process.exit(1);
}

if (!fs.existsSync(environmentPath)) {
  console.error(`Environment file not found: ${environmentPath}`);
  process.exit(1);
}

// Run Newman with the collection and environment
newman.run({
  collection: collectionPath,
  environment: environmentPath,
  reporters: ['cli']
}, function (err) {
  if (err) {
    console.error('Newman run failed:', err);
    process.exit(1);
  }
  console.log('Newman collection run completed.');
});
```

#### Package.json Configuration

The bash script is integrated into the project via package.json:

```json
"test:api": "bash tests/postman/run-newman.sh tests/postman/api-collection.json -e tests/postman/environment.json",
"test:api:explain": "echo \"Newman is used to run Postman collections for API testing via a bash script that fixes issues with Node.js v22+\""
```

#### Benefits of This Approach

1. **Backward and Forward Compatibility**: Works with multiple Node.js versions
2. **Multiple Fallback Methods**: If one approach fails, others are tried
3. **No Manual Node.js Downgrade Required**: Users don't need to switch Node.js versions
4. **Transparent to End Users**: Just run `npm run test:api` as normal
5. **Self-Documenting**: The script includes detailed comments explaining each method
6. **No External Dependencies**: Uses only built-in tools and installed packages

#### When to Use This

Use this approach when:
- You're running Node.js v22+ and need to use Newman
- You encounter "global is not defined" errors or issues with `__proto__` access
- You want a solution that works across different environments without manual intervention

### 2. Jest Unit Tests

The project includes two types of Jest test files:

#### Mock OpenAI API Tests (`tests/mock-openai-api.test.js`)

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
npm test tests/mock-openai-api.test.js
```

#### OpenAI Client Tests (`tests/openai-assistants-example/assistant-client.test.js`)

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

### API Contract Verification

The API contract is specified implicitly through the test cases in the Postman collection. Each test defines the expected request format and response structure, effectively documenting the API contract.

Key API testing practices:

- **Organize by Folders**: Group related API endpoints in folders
- **Use Environment Variables**: Don't hardcode URLs, ports, etc.
- **Secure API Keys**: Always store API keys in the `.secrets` folder, which should be excluded from version control. This project does not use environment variables for security reasons.

To verify your API implementation:

- Run the API server: `npm run start:server`
- Run the API tests: `npm run test:api`

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

- Go to the [OpenAI API keys page](https://platform.openai.com/api-keys).
- Log in or create an account if you don't have one.
- Click on "+ Create new secret key".
- Give your key a name (e.g., "api-testing-example") and click "Create secret key".
- **Important:** Copy the generated API key immediately and store it securely. You will not be able to see it again through the OpenAI website.

### Configuring the API Key

The client code exclusively loads the API key from a file at `.secrets/api-keys.js` with the following structure:
   
   ```javascript
   module.exports = {
     OPENAI_API_KEY: 'your_actual_api_key_here'
   };
   ```

**Important Security Note:** This project does not use environment variables for storing API keys to enforce better security practices. All API keys must be stored in the `.secrets` directory.

**Do NOT commit your API key directly into the code or repository.**

For local development:

- Create the `.secrets` directory in the project root if it doesn't exist
- Create a file `.secrets/api-keys.js` with your API key
- Ensure `.secrets` is listed in your `.gitignore` file

### API Testing Best Practices

When writing tests for this API, consider the following best practices:

- **Organize by Folders**: Group related API endpoints in folders
- **Use Environment Variables**: Don't hardcode URLs, ports, etc.
- **Secure API Keys**: Always store API keys in the `.secrets` folder, never in environment variables or the code
- **Test Scripts**: Validate responses thoroughly (examples in `tests/postman/api-collection.json`)
- **CI/CD Integration**: Run Newman in your CI/CD pipeline

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
- `npm run start` - Start the mock API server using PM2
- `npm run stop` - Stop the running API server
- `npm run restart` - Restart the API server
- `npm run status` - Check the status of PM2 processes
- `npm run logs` - View real-time logs from the API server
- `npm run logs:recent` - View the most recent logs (20 lines)
- `npm run delete` - Remove the API server from PM2
- `npm run test:api` - Run Newman tests against the mock API server with Node.js v22+ compatibility

## Dependencies

- Express - Web server framework for the mock API server
- Jest - Testing framework for unit tests
- Newman - Command-line runner for Postman collections
- OpenAI - SDK for interacting with OpenAI's Assistants API

## License

ISC
