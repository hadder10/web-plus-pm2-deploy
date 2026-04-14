const dotenv = require("dotenv");

dotenv.config({ path: "./.env.deploy" });

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REF,
  DEPLOY_REPOSITORY,
  DEPLOY_KEY,
} = process.env;

module.exports = {
  apps: [
    {
      name: "mesto-front",
      script: "./dist/app.js",
    },
  ],

  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPOSITORY,
      path: DEPLOY_PATH,
      key: DEPLOY_KEY,
      "post-deploy": "cd frontend && pwd && npm i && npm run build",
    },
  },
};
