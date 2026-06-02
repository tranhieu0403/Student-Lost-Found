#!/usr/bin/env bash
# Script chạy trên EC2 sau khi pull code mới về.
# Build lại image và khởi động lại container.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Building & restarting containers"
docker compose pull || true
docker compose up -d --build

echo "==> Pruning old images"
docker image prune -f

echo "==> Done. Service status:"
docker compose ps
