require("dotenv").config({
  path: require("path").join(__dirname, ".env.deploy"),
});

module.exports = {
  apps: [
    {
      name: "backend",
      script: "./src/app.ts",
      instances: "max",
      exec_mode: "cluster",
      watch: true,
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
      "post-deploy":
        "cd backend && npm install && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
