import type { DB } from "../db/pg";
import type { Queue } from "../queue/redis";
import type { NotificationPayload } from "../types/payload";

export class NotificationController {
    private readonly queue: Queue;
    private readonly db: DB;

    constructor(queue: Queue, db: DB) {
        this.queue = queue;
        this.db = db;
    }

    async handleNotification(payload: NotificationPayload): Promise<string | null> {
        return await this.queue.enqueueMessage(payload.type, payload);
        //! persist this into db for future reference
    }
}
