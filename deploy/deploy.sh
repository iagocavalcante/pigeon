#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

git pull --ff-only

docker compose -f deploy/docker-compose.prod.yml up -d --build

status=0

web_code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8098/)
if [ "$web_code" = "200" ]; then
  echo "OK: web responded 200"
else
  echo "FAIL: web responded ${web_code}, expected 200"
  status=1
fi

api_code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100/api/lists)
if [ "$api_code" = "401" ]; then
  echo "OK: api responded 401"
else
  echo "FAIL: api responded ${api_code}, expected 401"
  status=1
fi

exit $status
