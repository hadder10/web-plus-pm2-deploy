const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env.deploy"),
});

const { DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_KEY } = process.env;

module.exports = {
  apps: [
    {
      name: "backend",
      script: "dist/app.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: process.env.DEPLOY_REF,
      repo: process.env.DEPLOY_REPO,
      path: DEPLOY_PATH,
      key: DEPLOY_KEY,
      "pre-deploy-local": [
        `scp -i ${DEPLOY_KEY} ../.env.deploy ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/current/backend/.env.deploy`,
        `scp -i ${DEPLOY_KEY} .env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/current/backend/.env`,
      ].join(" && "),
      "post-deploy":
        "cd backend && npm ci --only=production && npm run build && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
