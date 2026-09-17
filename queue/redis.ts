import Redis from "ioredis";
import type { NotificationChannel, NotificationPayload } from "../types/payload";

export type StreamEntry = {
    id: string;
    payload: NotificationPayload;
};

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
        } catch (error) {
            console.error(`Error enqueueing message to queue ${queueName}:`, error);
            return null;
        }
    }

    async readMessages(queueName: NotificationChannel, count: number, blockMs: number): Promise<StreamEntry[]> {
        try {
            const result = await this.q.xread("COUNT", count, "BLOCK", blockMs, "STREAMS", queueName, "$") as Array<[string, Array<[string, string[]]>]> | null;
            const data = result?.[0]?.[1] ?? [];

            return data.map(([entryId, values]) => {
                const message = Object.fromEntries(Array.from({ length: values.length / 2 }, (_, index) => {
                    const key = values[index * 2];
                    const value = values[index * 2 + 1];
                    return [key, value] as const;
                }));

                return {
                    id: entryId,
                    payload: JSON.parse(message["payload"] ?? "{}") as NotificationPayload,
                };
            });
        } catch (error) {
            console.error(`Error reading message from queue ${queueName}:`, error);
            return [];
        }
    }

    async ackMessage(queueName: NotificationChannel, messageId: string): Promise<void> {
        try {
            await this.q.xdel(queueName, messageId);
        } catch (error) {
            console.error(`Error removing ${messageId} from ${queueName}:`, error);
        }
    }
}