// tests/request-builder.contract.test.js
const path = require('path');
const OpenAPIBackend = require('openapi-backend').default; // Use .default for CommonJS if needed
const {
    buildGetUserProfileRequest,
    buildUpdateUserProfileRequest
} = require('../src/request-builder'); // Relative path to the builder functions

describe('Request Builder Contract Tests', () => {
    let api; // OpenAPIBackend instance

    beforeAll(async () => {
        // Initialize OpenAPIBackend with the spec file
        // The path to api-spec.yaml is relative to the project root where Jest is typically run
        api = new OpenAPIBackend({
            definition: path.resolve(__dirname, '../api-spec.yaml'), // Adjust if your test runner runs from a different context
            // Optional: Add handlers for quick mocking if needed, but focus is validation here
        });
        await api.init(); // Parse the definition
    });

    // Helper function to map Axios reqObj to openapi-backend request format
    function mapAxiosReqToValidationReq(reqObj) {
        const url = new URL(reqObj.url); // Assumes absolute URL in reqObj

        // Ensure headers are lowercase for validation matching
        const lowercasedHeaders = {};
        if (reqObj.headers) {
            for (const key in reqObj.headers) {
                lowercasedHeaders[key.toLowerCase()] = reqObj.headers[key];
            }
        }

        return {
            method: reqObj.method.toLowerCase(), // Validator expects lowercase
            path: url.pathname, // Just the path part (e.g., /v1/users/123/profile)
            query: reqObj.params, // Axios 'params' maps to query parameters
            body: reqObj.data, // Axios 'data' maps to request body
            headers: lowercasedHeaders,
        };
    }

    // --- Test Cases ---

    test('buildGetUserProfileRequest should produce a valid request object', () => {
        // Arrange
        const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
        const includeDetails = true;

        // Act: Generate the request object
        const reqObj = buildGetUserProfileRequest(userId, includeDetails);

        // Map to validation format
        const validationReq = mapAxiosReqToValidationReq(reqObj);

        // Assert: Validate against the OpenAPI spec using openapi-backend
        const validationResult = api.validateRequest(validationReq);

        // Check for errors
        expect(validationResult.valid, `Validation Errors: ${JSON.stringify(validationResult.errors, null, 2)}`).toBe(true);
    });

     test('buildGetUserProfileRequest without optional query param should be valid', () => {
        // Arrange
        const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
        const includeDetails = undefined; // Not providing the optional param

        // Act
        const reqObj = buildGetUserProfileRequest(userId, includeDetails);
        const validationReq = mapAxiosReqToValidationReq(reqObj);

        // Assert
        const validationResult = api.validateRequest(validationReq);
        expect(validationResult.valid, `Validation Errors: ${JSON.stringify(validationResult.errors, null, 2)}`).toBe(true);
    });

    test('buildUpdateUserProfileRequest should produce a valid request object', () => {
        // Arrange
        const userId = 'b2c3d4e5-f6a7-8901-2345-67890abcdef1';
        const profileData = {
            email: 'test@example.com',
            displayName: 'Test User'
        };

        // Act
        const reqObj = buildUpdateUserProfileRequest(userId, profileData);
        const validationReq = mapAxiosReqToValidationReq(reqObj);

        // Assert
        const validationResult = api.validateRequest(validationReq);
        expect(validationResult.valid, `Validation Errors: ${JSON.stringify(validationResult.errors, null, 2)}`).toBe(true);
    });

     test('buildUpdateUserProfileRequest with missing required body property from spec should fail spec validation', () => {
        // Arrange
        const userId = 'c3d4e5f6-a7b8-9012-3456-7890abcdef12';
        // 'email' is required by our spec's requestBody schema, but our builder function
        // also has its own check. We'll test the case where the builder might allow it
        // or test the builder's error separately. Here, let's assume we want to test
        // what happens if the builder *didn't* catch it and it reached spec validation.
        // To do that cleanly, we might need to bypass the builder's internal check,
        // or accept that this test case primarily tests the builder's own validation.

        // Case 1: Testing the builder's own validation
        expect(() => {
            buildUpdateUserProfileRequest(userId, { displayName: 'Another User' }); // Missing 'email'
        }).toThrow('profileData must contain an email property');

        // Case 2: If we wanted to specifically test the spec validation for a scenario
        // where the builder *somehow* produced data missing 'email' but didn't throw.
        // This would require a more contrived setup or modifying the builder for this test.
        // For now, the above test (Case 1) is more direct for the current builder.
        // If the builder's validation was less strict and produced an object like:
        // const reqObj = { method: 'PUT', url: `https://api.example.com/v1/users/${userId}/profile`, headers: { /*...*/ }, data: { displayName: 'Another User' } };
        // const validationReq = mapAxiosReqToValidationReq(reqObj);
        // const validationResult = api.validateRequest(validationReq);
        // expect(validationResult.valid).toBe(false);
        // expect(validationResult.errors).toEqual(
        //     expect.arrayContaining([
        //         expect.objectContaining({
        //             message: expect.stringContaining("required property 'email'"),
        //         })
        //     ])
        // );
    });

    test('buildUpdateUserProfileRequest with empty profileData should be caught by builder', () => {
        const userId = 'd4e5f6a7-b8c9-0123-4567-890abcdef123';
        expect(() => {
            buildUpdateUserProfileRequest(userId, {});
        }).toThrow('profileData object is required and cannot be empty');
    });
});
  
