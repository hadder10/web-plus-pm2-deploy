const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env.deploy"),
});

module.exports = {
  apps: [
    {
      name: "backend",
      script: "./backend/dist/app.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      user: process.env.DEPLOY_USER,
      host: process.env.DEPLOY_HOST,
      ref: process.env.DEPLOY_REF,
      repo: process.env.DEPLOY_REPO,
      path: process.env.DEPLOY_PATH,
      key: process.env.DEPLOY_KEY,
      "pre-deploy": "scp -i ${key} .env.deploy ${user}@${host}:${path}/",
      "post-deploy":
        "cd backend && npm install && npm run build && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
