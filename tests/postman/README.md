# Integrating Postman for API Testing

This guide explains how to use Postman for API testing in this project, replacing the previous Dredd-based setup.

## Setup Instructions

1. **Install Newman and the HTML reporter**

   ```bash
   npm install --save-dev newman newman-reporter-html
   ```

2. **API Key Setup**
   - API keys are stored in the `.secrets/api-keys.js` file
   - The server loads API keys directly from this file, not from environment variables
   - Make sure `.secrets/api-keys.js` exists with your OpenAI API key

3. **Postman Collection Setup**
   - The collection is located at `tests/postman/api-collection.json`
   - Environment variables (excluding API keys) are in `tests/postman/environment.json`
   - Helper scripts are available in the `tests/postman` directory

## Using Postman GUI

1. Import the collection and environment files into Postman:
   - Open Postman desktop app
   - Click on "Import" button
   - Select the `tests/postman/api-collection.json` file
   - Import the `tests/postman/environment.json` environment
   
   > **Important**: API keys are managed server-side from `.secrets/api-keys.js` and are not exposed to Postman

2. Make sure your server is running:

   ```bash
   npm run start:server
   ```

3. Run the collection from Postman GUI to test your API endpoints

## Using Newman CLI

1. Run the API tests from the command line:

   ```bash
   npm run test:api
   ```

2. Generate an HTML report:

   ```bash
   npm run test:api:report
   ```

   This will create a report in `reports/newman-report.html`

## Writing Tests

### Adding a New API Test

1. Open the collection in Postman
2. Create a new request with appropriate HTTP method, URL, and body
3. Add test scripts in the "Tests" tab:

   ```javascript
   pm.test("Status code is 200", function() {
       pm.response.to.have.status(200);
   });

   pm.test("Response contains expected data", function() {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property("property_name");
   });
   ```

### Using Helper Functions

Import helper functions at the top of your test script:

```javascript
// Access helper functions
eval(pm.globals.get('validateContentType'));
eval(pm.globals.get('checkResponseTime'));

// Use helper functions in your tests
validateContentType('application/json');
checkResponseTime(500);
```

## Best Practices

1. **Organize by Folders**: Group related API endpoints in folders
2. **Use Environment Variables**: Don't hardcode URLs, ports, etc.
3. **Secure API Keys**: Keep API keys in `.secrets` folder, not in environment variables
4. **Pre-request Scripts**: Use them for setup like generating test data
5. **Test Scripts**: Validate responses thoroughly
6. **CI/CD Integration**: Run Newman in your CI/CD pipeline

## Learn More

- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
