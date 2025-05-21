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

// Set __proto__ access to allow for legacy dependencies
try {
  // Find the installed newman module
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
