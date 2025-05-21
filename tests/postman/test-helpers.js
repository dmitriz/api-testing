// Helper functions for Postman tests

/**
 * Validates common API response structure
 * @param {Object} jsonData - The response JSON data 
 */
function validateCommonResponseStructure(jsonData) {
  pm.test('Response has required structure', function() {
    pm.expect(jsonData).to.be.an('object');
    // Add any common validations for your API responses
  });
}

/**
 * Checks response time is within acceptable limits
 * @param {number} maxTime - Maximum acceptable time in ms
 */
function checkResponseTime(maxTime = 1000) {
  pm.test(`Response time is less than ${maxTime}ms`, function() {
    pm.expect(pm.response.responseTime).to.be.below(maxTime);
  });
}

/**
 * Validates content type header
 * @param {string} contentType - Expected content type
 */
function validateContentType(contentType = 'application/json') {
  pm.test('Content-Type header is present', function() {
    pm.response.to.have.header('Content-Type');
    pm.expect(pm.response.headers.get('Content-Type')).to.include(contentType);
  });
}

// Make functions available globally
// In your test scripts, you can use these functions directly
pm.globals.set('validateCommonResponseStructure', validateCommonResponseStructure.toString());
pm.globals.set('checkResponseTime', checkResponseTime.toString());
pm.globals.set('validateContentType', validateContentType.toString());
