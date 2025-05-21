// Pre-request script that can be shared across requests 
// These are scripts that are executed before a request is sent
// Useful for setting dynamic variables, authentication tokens, etc.

// Generate a timestamp for use in requests
pm.variables.set('timestamp', new Date().getTime());

// Example: Generate a random user ID for testing
const randomUserId = 'user_' + Math.random().toString(36).substring(2, 10);
pm.variables.set('randomUserId', randomUserId);

// NOTE: In a real-world scenario with Postman, the API key would be loaded here
// from external sources. However, in this specific implementation, the API key
// is loaded directly from the .secrets folder in the server code, not in Postman.
//
// For security reasons, the actual API key is not exposed to Postman and is managed
// server-side from the .secrets/api-keys.js file.

console.log('Pre-request script executed: Set random user ID:', randomUserId);
