# Push Notification Service

A minimal notification pipeline built with Express, Redis streams, and PostgreSQL. It accepts notifications, validates them, queues them by channel, and dispatches them through independent workers.

## Architecture

![Basic HLD](hld/static/basic_hld.png)

![Extended HLD](hld/static/extended_hld.png)

![Final HLD](hld/static/final_hld.png)

## Components

- API server: accepts incoming notification requests and applies rate limiting
- Validator: checks payload shape and channel values
- Controller: pushes valid notifications into the correct Redis stream
- Queue: Redis streams for ios, android, sms, and mail channels
- Worker: reads queued jobs, checks duplicate event IDs, and sends payloads
- Database: stores deduplication state and delivery status

## Flow

1. Client sends a notification request to the API.
2. The request passes through validation and rate limiting.
3. The controller enqueues the message in the Redis stream for that channel.
4. The worker reads from the stream.
5. If the event ID was already seen, it is discarded.
6. Otherwise, it sends the notification to the appropriate provider and stores the result.

## How to run

Set the required environment variables:

```bash
export PORT=3000
export REDIS_URL=redis://localhost:6379
export POSTGRES_URL=postgres://postgres:postgres@localhost:5432/notifications
```

Install dependencies:

```bash
bun install
```

Use the build file to start both services together:

```bash
./run.sh
```

The build file is the project's helper script for local startup. It launches the API and worker together so the queue can begin processing immediately. You can also start them separately:

```bash
bun run dev
bun run worker
```
