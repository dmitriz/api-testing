# API Request Builder Contract Test Example

This repository demonstrates contract testing for both API consumers (using a request builder) and API providers (using an Express server) with OpenAPI specifications.

## Project Overview

This project serves as an example of:
1. A Node.js Express API server that implements the endpoints defined in `api-spec.yaml`
2. Contract testing of the API provider using Dredd
3. In-memory data storage for demonstration purposes

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

The server will run on http://localhost:3000 and will display the available user IDs and endpoints.

## API Endpoints

The API server implements the following endpoints as defined in the `api-spec.yaml` file:

- `GET /v1/users/{userId}/profile` - Get a user's profile
- `PUT /v1/users/{userId}/profile` - Update a user's profile

### Available Test Users

The server comes pre-configured with the following test users:

| User ID | Email | Display Name |
|---------|-------|--------------|
| a1b2c3d4-e5f6-7890-1234-567890abcdef | test.user.A@example.com | Test User A (from spec example) |
| b2c3d4e5-f6a7-8901-2345-67890abcdef1 | test.user.B@example.com | Test User B (from spec example) |
| f4a7b8c9-d0e1-2345-6789-0abcdef12345 | original.get.user@example.com | Original GET User |

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

## Project Structure

- `api-spec.yaml` - OpenAPI specification defining the API contract
- `src/api-server.js` - Express API server implementation
- `dredd.yml` - Configuration for the Dredd API testing tool

## Scripts

- `npm test` - Run Jest tests for consumer-side code
- `npm run start:server` - Start the API server
- `npm run test:contract:provider` - Run Dredd contract tests against the provider

## Dependencies

- Express - Web server framework for the API
- Dredd - Contract testing tool for validating API implementations
- Jest - Testing framework
- OpenAPI Backend - OpenAPI utilities

## License

ISC
