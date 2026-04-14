#!/bin/bash
# Usage: bash deployEnv.sh <user@host> <project_path>
SSH_CONFIG="${1}"
PROJECT_PATH="${2}"

# Determine repository root (one level up from backend/scripts)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Copy top-level .env.deploy if exists
if [ -f "${ROOT_DIR}/.env.deploy" ]; then
	scp -Cr "${ROOT_DIR}/.env.deploy" "$SSH_CONFIG:${PROJECT_PATH}/current/.env.deploy"
fi

# Copy frontend .env.deploy if exists
if [ -f "${ROOT_DIR}/frontend/.env.deploy" ]; then
	scp -Cr "${ROOT_DIR}/frontend/.env.deploy" "$SSH_CONFIG:${PROJECT_PATH}/current/frontend/.env.deploy"
fi

# Copy backend .env.deploy if exists
if [ -f "${ROOT_DIR}/backend/.env.deploy" ]; then
	scp -Cr "${ROOT_DIR}/backend/.env.deploy" "$SSH_CONFIG:${PROJECT_PATH}/current/backend/.env.deploy"
fi

exit 0
