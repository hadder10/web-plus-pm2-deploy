/**
 * Деплой бэкенда и фронтенда: pm2 deploy production для обеих частей.
 * Требует .env.deploy в корне и backend/.env на месте.
 */
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

require('dotenv').config({ path: path.join(root, '.env.deploy') });
if (!process.env.DEPLOY_HOST || !process.env.DEPLOY_PATH) {
  console.error('Создайте .env.deploy в корне проекта (см. .env.deploy.example)');
  process.exit(1);
}

const run = (dir, label) => {
  console.log(`\n--- ${label} ---\n`);
  execSync('pm2 deploy ecosystem.config.js production', {
    cwd: path.join(root, dir),
    stdio: 'inherit',
    shell: true,
  });
};

run('backend', 'Деплой бэкенда');
run('frontend', 'Деплой фронтенда');
console.log('\nГотово.\n');
