const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../../.env.deploy"),
});

module.exports = {
  apps: [],

  deploy: {
    production: {
      user: process.env.DEPLOY_USER,
      host: process.env.DEPLOY_HOST,
      ref: process.env.DEPLOY_REF,
      repo: process.env.DEPLOY_REPO,
      path: process.env.DEPLOY_PATH,
      key: process.env.DEPLOY_KEY,

      "post-deploy": `
        cd frontend &&
        npm ci &&
        npm run build
      `,
    },
  },
};
