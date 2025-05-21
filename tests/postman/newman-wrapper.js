#!/usr/bin/env node

/**
 * Newman Compatibility Wrapper
 * 
 * This script adds a polyfill for the global object and other fixes
 * needed to run Newman with Node.js v22+
 */

// Polyfill global for Node.js v22+
if (typeof global === 'undefined') {
  global = globalThis;
}

// Run Newman via the CLI
require('newman/bin/newman');
