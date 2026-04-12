const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env.deploy"),
});

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
      user: process.env.DEPLOY_USER,
      host: process.env.DEPLOY_HOST,
      ref: process.env.DEPLOY_REF,
      repo: process.env.DEPLOY_REPO,
      path: process.env.DEPLOY_PATH,
      key: process.env.DEPLOY_KEY,

      "pre-deploy-local": `
        scp -i \${key} ../.env.deploy \${user}@\${host}:\${path}/current/backend/.env.deploy &&
        scp -i \${key} .env \${user}@\${host}:\${path}/current/backend/.env
      `,

      "post-deploy": `
        cd backend &&
        npm ci --only=production &&
        npm run build &&
        pm2 startOrRestart backend/ecosystem.config.js --env production
      `,
    },
  },
};
