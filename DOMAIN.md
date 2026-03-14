# Домен и привязка к серверу

Домен фронтенда: **eioven-mesto.nomorepartiessite.ru**  
API (бэкенд): **api.eioven-mesto.nomorepartiessite.ru**

## 1. DNS-записи

В панели управления доменом (сервис, где зарегистрирован домен) добавьте **A-записи**, указывающие на **публичный IP вашего сервера**:

| Тип | Имя / поддомен | Значение        |
|-----|----------------|-----------------|
| A   | `@` или `eioven-mesto` | `ВАШ_ПУБЛИЧНЫЙ_IP` |
| A   | `api`          | `ВАШ_ПУБЛИЧНЫЙ_IP` |

- Для корня домена `eioven-mesto.nomorepartiessite.ru` обычно указывают имя `@` или оставляют поле пустым (зависит от регистратора).
- Для поддомена `api` создайте отдельную A-запись с именем `api`.

После сохранения подождите 5–30 минут, пока обновятся DNS.

## 2. Nginx на сервере

Чтобы по доменам открывались фронтенд и API, на сервере нужен reverse proxy (например, nginx).

Установка nginx (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install nginx -y
```

Пример конфигурации для двух доменов (файл можно создать как `/etc/nginx/sites-available/eioven-mesto`):

```nginx
# Фронтенд: eioven-mesto.nomorepartiessite.ru
server {
    listen 80;
    server_name eioven-mesto.nomorepartiessite.ru;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Бэкенд (API): api.eioven-mesto.nomorepartiessite.ru
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

Включение конфига и проверка:

```bash
sudo ln -s /etc/nginx/sites-available/eioven-mesto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Порты **3000** (бэкенд) и **5000** (фронтенд через `serve`) должны совпадать с теми, на которых запущены приложения под PM2.

## 3. SSL-сертификаты (HTTPS)

Чтобы клиент мог обращаться к серверу по **https**, выпустите бесплатные сертификаты Let's Encrypt с помощью **Certbot**.

### 3.1. Установка Certbot (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 3.2. Выпуск сертификатов

Сначала должен быть настроен nginx по HTTP (раздел 2) и домены должны указывать на сервер. Затем выполните:

```bash
sudo certbot --nginx -d eioven-mesto.nomorepartiessite.ru -d api.eioven-mesto.nomorepartiessite.ru
```

Certbot предложит ввести email для уведомлений и согласие с условиями. После этого он автоматически:
- получит сертификаты для обоих доменов;
- изменит конфигурацию nginx, добавив HTTPS и редирект с HTTP на HTTPS.

Проверка и перезагрузка nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3. Продление сертификатов

Let's Encrypt выдаёт сертификаты на 90 дней. Автопродление обычно уже настроено. Проверить таймер:

```bash
sudo systemctl status certbot.timer
```

При необходимости продлить вручную:

```bash
sudo certbot renew --dry-run
```

### 3.4. Пример конфигурации nginx с SSL (если настраиваете вручную)

Если не используете `certbot --nginx`, можно задать серверы с SSL вручную. Certbot кладёт сертификаты в `/etc/letsencrypt/live/ДОМЕН/`. Для двух доменов нужны два блока `server` с `listen 443 ssl`:

```nginx
# Редирект HTTP -> HTTPS
server {
    listen 80;
    server_name eioven-mesto.nomorepartiessite.ru api.eioven-mesto.nomorepartiessite.ru;
    return 301 https://$host$request_uri;
}

# Фронтенд (HTTPS)
server {
    listen 443 ssl http2;
    server_name eioven-mesto.nomorepartiessite.ru;

    ssl_certificate     /etc/letsencrypt/live/eioven-mesto.nomorepartiessite.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eioven-mesto.nomorepartiessite.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Бэкенд / API (HTTPS)
server {
    listen 443 ssl http2;
    server_name api.eioven-mesto.nomorepartiessite.ru;

    ssl_certificate     /etc/letsencrypt/live/api.eioven-mesto.nomorepartiessite.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.eioven-mesto.nomorepartiessite.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

Если выпускали один сертификат на оба домена (`certbot ... -d eioven-mesto... -d api.eioven-mesto...`), путь к сертификату может быть общим, например `/etc/letsencrypt/live/eioven-mesto.nomorepartiessite.ru/` — тогда в обоих блоках укажите этот путь.

## 4. Домен бэкенда во фронтенде и передеплой

Во фронтенде домен бэкенда уже задан по HTTPS в `frontend/.env.production`:

```
REACT_APP_API_URL=https://api.eioven-mesto.nomorepartiessite.ru
```

После настройки SSL на сервере пересоберите и задеплойте фронтенд, чтобы в сборке использовался этот адрес:

```bash
# из корня проекта
npm run deploy
```

или только фронтенд:

```bash
cd frontend
npm run build
pm2 deploy ecosystem.config.js production
```

После передеплоя сайт и API должны открываться по https.

## 5. Проверка

- Фронтенд: откройте в браузере **https://eioven-mesto.nomorepartiessite.ru** — страница должна загружаться по HTTPS (замок в адресной строке).
- API: откройте **https://api.eioven-mesto.nomorepartiessite.ru** — ответ сервера без ошибок сертификата.

Фронтенд обращается к API по адресу `https://api.eioven-mesto.nomorepartiessite.ru` (переменная `REACT_APP_API_URL` в `frontend/.env.production`). Бэкенд разрешает запросы с домена фронтенда через CORS (`CORS_ORIGIN` в `backend/.env`).
