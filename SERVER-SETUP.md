# Пошаговая настройка сервера (VM) с нуля

Инструкция для виртуальной машины, к которой вы подключены по SSH. Выполняйте команды по порядку.

---

## Шаг 0. Проверка подключения

Вы уже подключены по SSH. Проверьте, что вы в домашней директории и есть права sudo:

```bash
pwd
whoami
sudo -v
```

Запомните имя пользователя (`whoami`) — оно должно совпадать с `DEPLOY_USER` в вашем локальном файле `.env.deploy`.

---

## Шаг 1. Обновление системы и базовые пакеты

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

---

## Шаг 2. Установка Node.js (LTS)

Бэкенд и фронтенд требуют Node.js. Устанавливаем LTS через NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

Проверка:

```bash
node -v
npm -v
```

Должны отобразиться версии (например, v20.x и 10.x).

---

## Шаг 3. Установка PM2 глобально

PM2 нужен для запуска приложений и автоперезапуска при падении.

```bash
sudo npm install -g pm2
pm2 -v
```

---

## Шаг 4. Установка и запуск MongoDB

Бэкенд по умолчанию подключается к `mongodb://localhost:27017/mestodb`. Нужна работающая MongoDB на сервере (или вы позже укажете облачный адрес в `backend/.env`).

**Вариант А: MongoDB на этом сервере**

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

Статус должен быть `active (running)`.

**Вариант Б: облачная MongoDB (MongoDB Atlas и т.п.)**

MongoDB на сервере устанавливать не нужно. Позже в `backend/.env` на сервере вы укажете переменную `DB_ADDRESS` с URI облачной базы.

---

## Шаг 5. Директория для деплоя и права

PM2 будет клонировать репозиторий в каталог, указанный в `DEPLOY_PATH` (например, `/var/www/app`). Его нужно создать и выдать права пользователю, от которого идёт деплой.

Подставьте вместо `ubuntu` вашего пользователя (результат `whoami`):

```bash
export DEPLOY_USER=$(whoami)
sudo mkdir -p /var/www/app
sudo chown -R $DEPLOY_USER:$DEPLOY_USER /var/www/app
ls -la /var/www
```

Должна быть директория `app`, владелец — ваш пользователь.

---

## Шаг 6. Доступ по SSH для деплоя с вашего компьютера

С вашей **локальной машины** деплой подключается к серверу по SSH. Чтобы не вводить пароль и чтобы PM2 мог клонировать репозиторий:

1. **На сервере** в домашней директории должен быть каталог для ключей и файл `authorized_keys`:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

2. **На вашем локальном компьютере** скопируйте публичный SSH-ключ на сервер (подставьте свой пользователь и IP/домен сервера):

```bash
# Выполнить на локальной машине (PowerShell или Git Bash):
type $env:USERPROFILE\.ssh\id_rsa.pub
# или на Linux/Mac:
# cat ~/.ssh/id_rsa.pub
```

Скопируйте вывод (строка вида `ssh-rsa AAAA...`).

3. **Снова на сервере** добавьте эту строку в конец файла:

```bash
echo "ВСТАВЬТЕ_СЮДА_ПУБЛИЧНЫЙ_КЛЮЧ_ИЗ_ШАГА_ВЫШЕ" >> ~/.ssh/authorized_keys
```

Проверка с локальной машины: `ssh ваш_пользователь@IP_сервера` — вход без пароля.

4. **Клонирование репозитория с сервера**: при деплое PM2 на сервере выполняет `git clone`. Если репозиторий **приватный**, на сервере нужно настроить доступ к GitHub/GitLab (например, загрузить свой SSH-ключ в `~/.ssh` на сервере и добавить его в настройки репозитория, либо использовать HTTPS с токеном). Для начала можно проверить деплой с **публичным** репозиторием.

---

## Шаг 7. Установка nginx

Nginx будет принимать запросы по HTTP/HTTPS и отдавать фронтенд и проксировать запросы к API.

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

Проверка в браузере: откройте `http://IP_ВАШЕГО_СЕРВЕРА` — должна открыться страница nginx «Welcome to nginx!». Позже мы заменим её на ваше приложение.

---

## Шаг 8. Открытие портов в файрволе

Нужны порты: **80** (HTTP), **443** (HTTPS), **3000** (API, если будете обращаться по IP).

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw status
sudo ufw enable
```

При запросе подтверждения введите `y`. Проверка: `sudo ufw status` — порты 80, 443, 3000 должны быть в списке разрешённых.

---

## Шаг 9. Деплой приложения с локального компьютера

Дальнейшие команды выполняются **на вашем компьютере** (не в SSH-сессии на сервере), в каталоге проекта.

1. Убедитесь, что заполнены:
   - корень проекта: **`.env.deploy`** (DEPLOY_HOST, DEPLOY_REPO, DEPLOY_USER, DEPLOY_PATH);
   - **`backend/.env`** (NODE_ENV, JWT_SECRET, CORS_ORIGIN, при необходимости DB_ADDRESS).

2. Первый раз — подготовка окружения на сервере (клонирование репозитория и установка зависимостей):

```bash
cd backend
pm2 deploy ecosystem.config.js production setup
```

При запросе пароля введите пароль пользователя на сервере (если ещё не настроен вход по ключу). Дождитесь окончания клонирования и `npm ci` в backend.

Затем то же для фронтенда:

```bash
cd ../frontend
pm2 deploy ecosystem.config.js production setup
```

3. Полный деплой (копирование .env на сервер, сборка и запуск под PM2):

```bash
cd ..
npm run deploy
```

Или по отдельности:

```bash
cd backend
pm2 deploy ecosystem.config.js production

cd ../frontend
pm2 deploy ecosystem.config.js production
```

При первом деплое бэкенда скрипт `copy-env-to-server.js` скопирует ваш локальный `backend/.env` на сервер в `shared/.env.backend`; при post-deploy он будет скопирован в `backend/.env` на сервере.

Если появится ошибка клонирования (например, «Permission denied» для приватного репо), вернитесь к шагу 6 и настройте на **сервере** доступ к репозиторию (SSH-ключ или токен).

---

## Шаг 10. Настройка nginx на сервере

Снова в SSH-сессии **на сервере**.

Создайте конфиг (можно через `nano` или `vim`):

```bash
sudo nano /etc/nginx/sites-available/eioven-mesto
```

Вставьте конфигурацию ниже. Замените `ВАШ_ПУБЛИЧНЫЙ_IP` на реальный IP сервера (или уберите блок с `server_name` с IP, если доступ только по домену).

```nginx
# Доступ по IP: фронтенд на порту 80
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# По домену: фронтенд
server {
    listen 80;
    server_name eioven-mesto.nomorepartiessite.ru;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# По домену: API
server {
    listen 80;
    server_name api.eioven-mesto.nomorepartiessite.ru;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Сохраните файл (в nano: Ctrl+O, Enter, Ctrl+X).

Включите сайт и проверьте конфигурацию:

```bash
sudo ln -sf /etc/nginx/sites-available/eioven-mesto /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

После этого:
- по адресу **http://IP_сервера** должен открываться фронтенд;
- API по домену: **http://api.eioven-mesto.nomorepartiessite.ru**;
- API по IP: **http://IP_сервера:3000** (если порт 3000 открыт в файрволе).

---

## Шаг 11. SSL-сертификаты (HTTPS)

Выполняется **на сервере**, после того как DNS для доменов уже указывает на этот сервер.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d eioven-mesto.nomorepartiessite.ru -d api.eioven-mesto.nomorepartiessite.ru
```

Следуйте подсказкам: введите email, согласитесь с условиями. Certbot настроит HTTPS и редирект с HTTP на HTTPS.

Проверка:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

В браузере откройте **https://eioven-mesto.nomorepartiessite.ru** и **https://api.eioven-mesto.nomorepartiessite.ru** — соединение должно быть по HTTPS.

---

## Шаг 12. Проверка приложений на сервере

В SSH на сервере:

```bash
pm2 list
pm2 logs
```

Должны быть процессы **backend** и **frontend** в статусе `online`. При необходимости перезапуск:

```bash
pm2 restart all
```

Проверка, что порты слушаются:

```bash
ss -tlnp | grep -E '3000|5000'
```

Должны быть 3000 (backend) и 5000 (frontend).

---

## Шаг 13. Проверка функциональности в браузере

На **локальном компьютере** откройте в браузере:

1. **Фронтенд**: https://eioven-mesto.nomorepartiessite.ru (или http://IP_сервера до настройки SSL).
2. **Регистрация**: нажмите «Зарегистрироваться», введите email и пароль — запрос уходит на API.
3. **Авторизация**: войдите под созданным пользователем.
4. **Редактирование профиля**: имя и описание — изменения сохраняются через API.
5. **Карточки**: добавьте карточку (название и ссылка на изображение), удалите карточку.
6. **Лайки**: поставьте и снимите лайк с карточки.

Все действия должны выполняться без ошибок в консоли браузера (F12 → Console) и без сообщений CORS. Если появляются ошибки CORS, проверьте в `backend/.env` на сервере переменную **CORS_ORIGIN** (должна быть `https://eioven-mesto.nomorepartiessite.ru` без слеша в конце) и перезапустите бэкенд: `pm2 restart backend`.

---

## Краткий чеклист по порядку

| № | Где        | Действие |
|---|------------|----------|
| 1 | Сервер    | Обновление системы, git, curl, build-essential |
| 2 | Сервер    | Установка Node.js LTS |
| 3 | Сервер    | Установка PM2 глобально |
| 4 | Сервер    | Установка и запуск MongoDB (или подготовка облачной БД) |
| 5 | Сервер    | Создание `/var/www/app`, права для пользователя деплоя |
| 6 | Сервер + локально | Настройка SSH-ключей и доступа к репозиторию |
| 7 | Сервер    | Установка nginx, запуск |
| 8 | Сервер    | Открытие портов 80, 443, 3000 в UFW |
| 9 | Локально  | Заполнить .env.deploy и backend/.env, выполнить `pm2 deploy production setup` для backend и frontend, затем `npm run deploy` |
| 10| Сервер    | Создать конфиг nginx для фронтенда и API, включить сайт, перезагрузить nginx |
| 11| Сервер    | Установить certbot, выпустить сертификаты для доменов |
| 12| Сервер    | Проверить `pm2 list` и логи |
| 13| Браузер   | Проверить регистрацию, вход, профиль, карточки, лайки |

После выполнения всех шагов приложение будет задеплоено, доступно по публичному IP и по доменам, с сохранённой функциональностью и HTTPS.
