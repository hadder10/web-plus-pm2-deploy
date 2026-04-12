const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.deploy") });

module.exports = {
  apps: [
    {
      name: "backend",
      script: "./backend/src/app.ts",
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

      "pre-deploy": `
        scp -i \${key} .env.deploy \${user}@\${host}:\${path}/current/ &&
        scp -i \${key} backend/.env \${user}@\${host}:\${path}/current/backend/
      `,

      "post-deploy": `
        cd backend &&
        npm ci --only=production &&
        npm run build &&
        cd .. &&
        pm2 startOrRestart ecosystem.config.js --env production
      `,
    },
  },
};
