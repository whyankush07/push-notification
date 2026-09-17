import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import type { NotificationChannel, NotificationPayload } from "../types/payload";

export class DB {
    client: Pool;

    constructor(dbUrl: string) {
        this.client = new Pool({
            connectionString: dbUrl,
            max: 10,
            idleTimeoutMillis: 30000,
        });
    }

    async runMigrations() {
        const migDir = path.join(__dirname, "..", "migrations");
        const files = fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();

        for (const file of files) {
            const filePath = path.join(migDir, file);
            const data = fs.readFileSync(filePath, "utf-8");
            await this.client.query(data);
        }

        console.log("Database migration completed!!");
    }

    async close() {
        await this.client.end();
    }

    async eventExists(eventId: string): Promise<boolean> {
        const result = await this.client.query(
            "SELECT 1 FROM notification_events WHERE event_id = $1 LIMIT 1",
            [eventId],
        );
        return result.rowCount? (result.rowCount) > 0 : false;
    }

    async markEventSeen(eventId: string, channel: NotificationChannel, payload: NotificationPayload): Promise<void> {
        await this.client.query(
            `INSERT INTO notification_events (event_id, channel, status, payload, created_at, updated_at)
            VALUES ($1, $2, 'seen', $3, NOW(), NOW())
            ON CONFLICT (event_id) DO UPDATE SET channel = EXCLUDED.channel, payload = EXCLUDED.payload, updated_at = NOW()`,
            [eventId, channel, JSON.stringify(payload)],
        );
    }

    async updateDeliveryStatus(eventId: string, channel: NotificationChannel, provider: string, status: string, payload: NotificationPayload): Promise<void> {
        await this.client.query(
            `INSERT INTO notification_events (event_id, channel, provider, status, payload, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            ON CONFLICT (event_id) DO UPDATE SET channel = EXCLUDED.channel, provider = EXCLUDED.provider, status = EXCLUDED.status, payload = EXCLUDED.payload, updated_at = NOW()`,
            [eventId, channel, provider, status, JSON.stringify(payload)],
        );
    }
}