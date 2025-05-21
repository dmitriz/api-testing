# API Request Builder Contract Test Example

This repository demonstrates API provider contract testing using an Express server implementation validated against OpenAPI specifications. It shows how to ensure your API implementation correctly follows its OpenAPI contract using Dredd for automated validation.

## Project Overview

This project serves as an example of:

1. A Node.js Express API server that implements the endpoints defined in `api-spec.yaml`
2. Contract testing of the API provider using Dredd
3. In-memory data storage for demonstration purposes
4. OpenAI Assistants API integration examples

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (v6 or higher recommended)

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

The server will run on <http://localhost:3000> and will display the available user IDs and endpoints.

## API Endpoints

The API server implements the following endpoints as defined in the `api-spec.yaml` file:

- `GET /v1/users/{userId}/profile` - Get a user's profile
- `PUT /v1/users/{userId}/profile` - Update a user's profile

### Available Test Users

The server comes pre-configured with the following test users:

| User ID | Email | Display Name |
|---------|-------|--------------|
| a1b2c3d4-e5f6-7890-1234-567890abcdef | <test.user.A@example.com> | Test User A (from spec example) |
| b2c3d4e5-f6a7-8901-2345-67890abcdef1 | <test.user.B@example.com> | Test User B (from spec example) |
| f4a7b8c9-d0e1-2345-6789-0abcdef12345 | <original.get.user@example.com> | Original GET User |

## Contract Testing

### Provider Contract Testing with Dredd

Dredd validates that the API provider correctly implements the API contract specified in `api-spec.yaml`.

To run provider contract tests (with the API server running):

```bash
npm run test:contract:provider
```

## Manual Testing

### Using cURL

#### GET a user profile

```bash
curl http://localhost:3000/v1/users/a1b2c3d4-e5f6-7890-1234-567890abcdef/profile
```

#### PUT (update) a user profile

```bash
curl -X PUT -H "Content-Type: application/json" \
  -d '{"email":"new.email@example.com", "displayName":"Updated Name A"}' \
  http://localhost:3000/v1/users/a1b2c3d4-e5f6-7890-1234-567890abcdef/profile
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

## Project Structure

- `api-spec.yaml` - OpenAPI specification defining the API contract
- `src/api-server.js` - Express API server implementation
- `dredd.yml` - Configuration for the Dredd API testing tool
- `src/openai-assistants-example/` - Examples of using the OpenAI Assistants API
- `src/api-client/` - Client-side code that consumes the API
- `tests/openai-assistants-example/` - Tests for the OpenAI Assistants examples
- `tests/api-client/` - Consumer-side tests that verify API client functionality

## Consumer-Side Testing

While Dredd tests validate that our API implementation meets the OpenAPI specification (provider testing), consumer-side tests verify that client code correctly interacts with the API:

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
- `npm run test:contract:provider` - Run Dredd contract tests against the provider

## Dependencies

- Express - Web server framework for the API
- Dredd - Contract testing tool for validating API implementations
- Jest - Testing framework
- OpenAI - SDK for interacting with OpenAI's APIs
- OpenAPI Backend - OpenAPI utilities

## License

ISC
