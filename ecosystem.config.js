module.exports = {
  apps: [{
    name: "api-server",
    script: "src/api-server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "200M",
    env: {
      NODE_ENV: "development",
      PORT: 3001
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3001
    },
    // Handle process exit behavior
    kill_timeout: 3000,  // Give the app time to handle remaining connections before forcing process kill
    restart_delay: 1000, // Delay before restarting a crashed app
    exp_backoff_restart_delay: 100 // Exponential backoff for restarts
  }]
};
