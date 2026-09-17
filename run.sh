#!/usr/bin/env bash
set -e

PORT=${PORT:-3000}
REDIS_URL=${REDIS_URL:-redis://localhost:6379}
POSTGRES_URL=${POSTGRES_URL:-postgres://postgres:postgres@localhost:5432/notifications}

export PORT
export REDIS_URL
export POSTGRES_URL

bun run index.ts &
API_PID=$!

bun run workers/worker.ts &
WORKER_PID=$!

trap 'kill $API_PID $WORKER_PID' EXIT

wait $API_PID $WORKER_PID
