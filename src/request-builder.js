// src/request-builder.js
const BASE_URL = 'https://api.example.com/v1';

function buildGetUserProfileRequest(userId, includeDetails) {
    if (!userId) {
        throw new Error('userId is required');
    }
    const reqObj = {
        method: 'GET',
        url: `${BASE_URL}/users/${userId}/profile`,
        headers: {
            'Accept': 'application/json'
        },
        params: {},
    };
    if (includeDetails !== undefined) {
        reqObj.params.includeDetails = includeDetails;
    }
    return reqObj;
}

function buildUpdateUserProfileRequest(userId, profileData) {
     if (!userId) {
        throw new Error('userId is required');
    }
     // In a real application, you might have more robust validation here
     // or rely on a validation library before even building the request.
     if (!profileData || typeof profileData !== 'object' || Object.keys(profileData).length === 0) {
        throw new Error('profileData object is required and cannot be empty');
     }
     if (!profileData.email) { // As per our spec, email is required in the body
        throw new Error('profileData must contain an email property');
    }
     const reqObj = {
        method: 'PUT',
        url: `${BASE_URL}/users/${userId}/profile`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: profileData
    };
    return reqObj;
}

module.exports = { buildGetUserProfileRequest, buildUpdateUserProfileRequest };
