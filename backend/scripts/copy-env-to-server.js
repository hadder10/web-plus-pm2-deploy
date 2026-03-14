/**
 * Копирует backend/.env на сервер в shared/.env.backend.
 * Используется в pre-deploy-local. Требует .env.deploy в корне проекта.
 */
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.join(root, '.env.deploy') });

const { DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH } = process.env;
if (!DEPLOY_USER || !DEPLOY_HOST || !DEPLOY_PATH) {
  console.error('Задайте DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH в .env.deploy');
  process.exit(1);
}

const localEnv = path.join(__dirname, '..', '.env');
const remoteDest = `${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/.env.backend`;

try {
  execSync(`scp "${localEnv}" "${remoteDest}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Не удалось скопировать .env на сервер. Проверьте SSH и путь.');
  process.exit(1);
}
