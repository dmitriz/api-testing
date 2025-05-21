/**
 * PM2 Configuration File
 * This file defines how the API server is managed by PM2 process manager
 */

module.exports = {
  apps: [
    {
      // Basic configuration
      // Name of the application in PM2
      name: "api-server",
      // Path to the main script file
      script: "src/mock-openai-api-server.js",
      // Number of instances to launch (1 = no clustering)
      instances: 1,

      // Restart behavior
      // Automatically restart if app crashes
      autorestart: true,

      // Memory management
      // 200M is a reasonable default for a small API server; adjust if you expect higher memory usage
      max_memory_restart: "200M",

      // Environment variables
      // Default environment (development)
      env: {
        NODE_ENV: "development",
        PORT: 3001,
        // Enable file watching in development for auto-reload
        WATCH: true
      },
      // Production environment settings
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        // Disable file watching in production
        WATCH: false
      },

      // Process management settings
      // Time (ms) to wait before forcing process termination
      // Allows server to finish handling active requests
      kill_timeout: 3000,
      // Wait time (ms) between auto-restarts
      restart_delay: 1000,
      // Starting delay for exponential backoff strategy
      // Prevents rapid restart loops if app keeps crashing
      exp_backoff_restart_delay: 100,

      // Use the 'watch' option based on environment variable
      // PM2 will interpret this as a boolean
      watch: process.env.WATCH === 'true'
    }
  ]
};
