/**
 * Ecosystem PM2 для бэкенда.
 * Параметры деплоя загружаются из .env.deploy в корне проекта.
 * Перед деплоем: создайте .env.deploy (см. .env.deploy.example) и backend/.env
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
  'pre-deploy-local': 'node scripts/copy-env-to-server.js',
  'post-setup': 'cd source/backend && npm ci',
  'post-deploy': [
    'cp ../shared/.env.backend backend/.env',
    'cd backend && npm ci && npm run build',
    'pm2 startOrRestart ecosystem.config.js --env production',
  ].join(' && '),
};

module.exports = {
  apps: [{
    name: 'backend',
    script: 'dist/app.js',
    cwd: path.join(__dirname),
    env_production: {
      NODE_ENV: 'production',
    },
  }],
  deploy: {
    production: deployProduction,
  },
};
