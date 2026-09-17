import Redis from "ioredis";
import type { NotificationChannel, NotificationPayload } from "../types/payload";

export class Queue {
    private q: Redis;

    constructor(redisUrl: string) {
        this.q = new Redis(redisUrl, {
            enableOfflineQueue: false,
            retryStrategy: (times) => {
                if (times > 5) {
                    return null;
                }
                return Math.min(times * 500, 2000);
            },
        });
    }

    getMessageQueue(): Redis {
        return this.q;
    }

    async enqueueMessage(queueName: NotificationChannel, payload: NotificationPayload): Promise<string | null> {
        try {
            return await this.q.xadd(queueName, "*", "payload", JSON.stringify(payload));
        } catch(error) {
            console.error(`Error enqueueing message to queue ${queueName}:`, error);
            return null;
        }
    }
}