/**
 * Ecosystem PM2 для фронтенда.
 * Параметры деплоя загружаются из .env.deploy в корне проекта.
 * Перед деплоем: создайте .env.deploy (см. .env.deploy.example в корне).
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.deploy') });

const {
  DEPLOY_HOST,
  DEPLOY_REPO,
  DEPLOY_USER,
  DEPLOY_PATH,
  DEPLOY_SSH_KEY,
  DEPLOY_REF = 'origin/main',
} = process.env;

if (!DEPLOY_HOST || !DEPLOY_REPO || !DEPLOY_USER || !DEPLOY_PATH) {
  throw new Error('В .env.deploy задайте DEPLOY_HOST, DEPLOY_REPO, DEPLOY_USER, DEPLOY_PATH');
}

const deployProduction = {
  user: DEPLOY_USER,
  host: DEPLOY_HOST,
  ref: DEPLOY_REF,
  repo: DEPLOY_REPO,
  path: DEPLOY_PATH,
  ...(DEPLOY_SSH_KEY && { key: DEPLOY_SSH_KEY }),
  'post-setup': 'cd source/frontend && npm ci',
  'post-deploy': [
    'cd frontend && npm ci && npm run build',
    'pm2 startOrRestart ecosystem.config.js --env production',
  ].join(' && '),
};

module.exports = {
  apps: [{
    name: 'frontend',
    script: 'npx',
    args: ['serve', '-s', 'build', '-l', '5000'],
    cwd: path.join(__dirname),
    env_production: {
      NODE_ENV: 'production',
    },
  }],
  deploy: {
    production: deployProduction,
  },
};
