import nodemailer from "nodemailer";
import { Queue } from "../queue/redis";
import type { DB } from "../db/pg";
import type { NotificationChannel, NotificationPayload } from "../types/payload";

export class NotificationWorker {
    private readonly queue: Queue;
    private readonly db: DB;
    private readonly mailer = nodemailer.createTransport({
        jsonTransport: true,
    });

    constructor(queue: Queue, db: DB) {
        this.queue = queue;
        this.db = db;
    }

    async start(): Promise<void> {
        const channels: NotificationChannel[] = ["ios", "android", "sms", "mail"];

        for (const channel of channels) {
            void this.processChannel(channel);
        }
    }

    private async processChannel(channel: NotificationChannel): Promise<void> {
        while (true) {
            const result = await this.queue.readMessages(channel, 10, 5000);

            for (const item of result) {
                const payload = item.payload;

                if (await this.db.eventExists(payload.id)) {
                    console.log(`Duplicate notification skipped: ${payload.id}`);
                    await this.queue.ackMessage(channel, item.id);
                    continue;
                }

                try {
                    await this.db.markEventSeen(payload.id, channel, payload);
                    await this.sendViaProvider(channel, payload);
                    await this.db.updateDeliveryStatus(payload.id, channel, this.getProviderName(channel), "sent", payload);
                    await this.queue.ackMessage(channel, item.id);
                } catch (error) {
                    console.error(`Failed to send ${channel} notification ${payload.id}:`, error);
                    await this.db.updateDeliveryStatus(payload.id, channel, this.getProviderName(channel), "failed", payload);
                    await this.queue.ackMessage(channel, item.id);
                }
            }
        }
    }

    private async sendViaProvider(channel: NotificationChannel, payload: NotificationPayload): Promise<void> {
        switch (channel) {
            case "ios":
                await this.sendAPNS(payload);
                return;
            case "android":
                await this.sendFCM(payload);
                return;
            case "sms":
                await this.sendTwilio(payload);
                return;
            case "mail":
                await this.sendEmail(payload);
                return;
            default:
                throw new Error(`Unsupported channel ${channel}`);
        }
    }

    private getProviderName(channel: NotificationChannel): string {
        switch (channel) {
            case "ios":
                return "apns";
            case "android":
                return "fcm";
            case "sms":
                return "twilio";
            case "mail":
                return "nodemailer";
            default:
                return "unknown";
        }
    }

    private async sendAPNS(payload: NotificationPayload): Promise<void> {
        console.log(`Sending APNS notification: ${payload.id}`);
        await Promise.resolve();
    }

    private async sendFCM(payload: NotificationPayload): Promise<void> {
        console.log(`Sending FCM notification: ${payload.id}`);
        await Promise.resolve();
    }

    private async sendTwilio(payload: NotificationPayload): Promise<void> {
        console.log(`Sending Twilio SMS: ${payload.id}`);
        await Promise.resolve();
    }

    private async sendEmail(payload: NotificationPayload): Promise<void> {
        await this.mailer.sendMail({
            from: "no-reply@example.com",
            to: payload.email ?? "example@example.com",
            subject: "Notification",
            text: payload.body,
            html: `<p>${payload.body}</p><p>${payload.cta}</p>`,
        });
    }
}
