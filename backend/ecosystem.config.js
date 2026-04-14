const dotenv = require("dotenv");

dotenv.config({ path: "./.env.deploy" });

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_REF,
  DEPLOY_REPOSITORY,
  DEPLOY_PATH,
  DEPLOY_KEY,
} = process.env;

module.exports = {
  apps: [
    {
      name: "mesto",
      script: "dist/app.js",
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
      ssh_options: "ForwardAgent=yes",
      "pre-deploy-local": `bash scripts/deployEnv.sh ${DEPLOY_USER}@${DEPLOY_HOST} ${DEPLOY_PATH}`,
      "post-deploy":
        "cd backend && pwd && npm install && npm run build && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
