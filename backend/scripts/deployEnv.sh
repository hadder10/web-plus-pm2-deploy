#!/bin/bash
SSH_CONFIG="${1}"
PROJECT_PATH="${2}"
SSH_KEY="${3:-/home/hadder/Загрузки/Бэкап_за_2026-03-08/some_ssh}"
scp -i "$SSH_KEY" -C .env "$SSH_CONFIG:${PROJECT_PATH}/current/backend"