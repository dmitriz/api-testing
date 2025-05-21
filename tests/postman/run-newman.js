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
