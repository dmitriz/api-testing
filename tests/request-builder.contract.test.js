// tests/request-builder.contract.test.js
const path = require('path');
const OpenAPIBackend = require('openapi-backend').default;
const {
    buildGetUserProfileRequest,
    buildUpdateUserProfileRequest
} = require('../src/request-builder');

describe('Request Builder Contract Tests', () => {
    let api;

    beforeAll(async () => {
        api = new OpenAPIBackend({
            definition: path.resolve(__dirname, '../api-spec.yaml'),
        });
        await api.init();
    });

    function mapAxiosReqToValidationReq(reqObj) {
        const url = new URL(reqObj.url);
        const lowercasedHeaders = {};
        if (reqObj.headers) {
            for (const key in reqObj.headers) {
                lowercasedHeaders[key.toLowerCase()] = reqObj.headers[key];
            }
        }
        return {
            method: reqObj.method.toLowerCase(),
            path: url.pathname,
            query: reqObj.params,
            body: reqObj.data,
            headers: lowercasedHeaders,
        };
    }

    // --- Original Test Cases ---
    test('buildGetUserProfileRequest should produce a valid request object for spec validation', () => {
        const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
        const includeDetails = true;
        const reqObj = buildGetUserProfileRequest(userId, includeDetails);
        const validationReq = mapAxiosReqToValidationReq(reqObj);
        const validationResult = api.validateRequest(validationReq);
        expect(validationResult.valid, `Validation Errors: ${JSON.stringify(validationResult.errors, null, 2)}`).toBe(true);
    });

    test('buildGetUserProfileRequest without optional query param should be valid for spec validation', () => {
        const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
        const includeDetails = undefined;
        const reqObj = buildGetUserProfileRequest(userId, includeDetails);
        const validationReq = mapAxiosReqToValidationReq(reqObj);
        const validationResult = api.validateRequest(validationReq);
        expect(validationResult.valid, `Validation Errors: ${JSON.stringify(validationResult.errors, null, 2)}`).toBe(true);
    });

    test('buildUpdateUserProfileRequest should produce a valid request object for spec validation', () => {
        const userId = 'b2c3d4e5-f6a7-8901-2345-67890abcdef1';
        const profileData = { email: 'test@example.com', displayName: 'Test User' };
        const reqObj = buildUpdateUserProfileRequest(userId, profileData);
        const validationReq = mapAxiosReqToValidationReq(reqObj);
        const validationResult = api.validateRequest(validationReq);
        expect(validationResult.valid, `Validation Errors: ${JSON.stringify(validationResult.errors, null, 2)}`).toBe(true);
    });

    test('buildUpdateUserProfileRequest with missing required body property (caught by builder)', () => {
        const userId = 'c3d4e5f6-a7b8-9012-3456-7890abcdef12';
        const invalidProfileData = { displayName: 'Another User' }; // Missing 'email'
        expect(() => {
            buildUpdateUserProfileRequest(userId, invalidProfileData);
        }).toThrow('profileData must contain an email property');
    });

    test('buildUpdateUserProfileRequest with empty profileData should be caught by builder', () => {
        const userId = 'd4e5f6a7-b8c9-0123-4567-890abcdef123';
        expect(() => {
            buildUpdateUserProfileRequest(userId, {});
        }).toThrow('profileData object is required and cannot be empty');
    });

    // --- New Test Cases for User ID Handling ---

    describe('Error Handling and Format Validation for userId in buildGetUserProfileRequest', () => {
        test('should throw an error if userId is null (builder validation)', () => {
            expect(() => {
                buildGetUserProfileRequest(null, true);
            }).toThrow('userId is required');
        });

        test('should throw an error if userId is undefined (builder validation)', () => {
            expect(() => {
                buildGetUserProfileRequest(undefined, true);
            }).toThrow('userId is required');
        });

        test('should throw an error if userId is an empty string (builder validation)', () => {
            expect(() => {
                buildGetUserProfileRequest('', true);
            }).toThrow('userId is required');
        });

        test('should build request but fail spec validation if userId is not a UUID format', () => {
            const userId = 'not-a-valid-uuid';
            const reqObj = buildGetUserProfileRequest(userId, false);
            const validationReq = mapAxiosReqToValidationReq(reqObj);
            const validationResult = api.validateRequest(validationReq);

            expect(reqObj).toBeDefined();
            expect(validationResult.valid).toBe(false);
            expect(validationResult.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.stringContaining('should match format "uuid"'),
                        path: expect.stringContaining('request.path.userId'),
                    })
                ])
            );
        });
    });

    describe('Error Handling and Format Validation for userId in buildUpdateUserProfileRequest', () => {
        const validProfileData = { email: 'test@example.com', displayName: 'Test User' };

        test('should throw an error if userId is null (builder validation)', () => {
            expect(() => {
                buildUpdateUserProfileRequest(null, validProfileData);
            }).toThrow('userId is required');
        });

        test('should throw an error if userId is undefined (builder validation)', () => {
            expect(() => {
                buildUpdateUserProfileRequest(undefined, validProfileData);
            }).toThrow('userId is required');
        });

        test('should throw an error if userId is an empty string (builder validation)', () => {
            expect(() => {
                buildUpdateUserProfileRequest('', validProfileData);
            }).toThrow('userId is required');
        });

        test('should build request but fail spec validation if userId is not a UUID format', () => {
            const userId = 'another-invalid-uuid-format';
            const reqObj = buildUpdateUserProfileRequest(userId, validProfileData);
            const validationReq = mapAxiosReqToValidationReq(reqObj);
            const validationResult = api.validateRequest(validationReq);

            expect(reqObj).toBeDefined();
            expect(validationResult.valid).toBe(false);
            expect(validationResult.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.stringContaining('should match format "uuid"'),
                        path: expect.stringContaining('request.path.userId'),
                    })
                ])
            );
        });
    });
});
          
