export type NotificationChannel = "ios" | "android" | "sms" | "mail";

export interface NotificationPayload {
    id: string;
    type: NotificationChannel;
    body: string;
    cta: string;
    createdAt: Date;
}
