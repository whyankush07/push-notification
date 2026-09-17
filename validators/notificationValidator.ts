import type { NextFunction, Request, Response } from "express";
import type { NotificationChannel, NotificationPayload } from "../types/payload";

const validChannels: NotificationChannel[] = ["ios", "android", "sms", "mail"];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const validateNotificationPayload = (req: Request, _res: Response, next: NextFunction): void => {
    const payload = req.body;

    if (!isRecord(payload)) {
        next(new Error("Notification payload is required"));
        return;
    }

    const id = payload.id;
    const type = payload.type;
    const body = payload.body;
    const cta = payload.cta;
    const createdAt = payload.createdAt;

    if (typeof id !== "string" || !id.trim()) {
        next(new Error("Notification id is required"));
        return;
    }

    if (typeof type !== "string" || !validChannels.includes(type as NotificationChannel)) {
        next(new Error("Notification type is invalid"));
        return;
    }

    if (typeof body !== "string" || !body.trim()) {
        next(new Error("Notification body is required"));
        return;
    }

    if (typeof cta !== "string" || !cta.trim()) {
        next(new Error("Notification cta is required"));
        return;
    }

    const parsedDate = new Date(createdAt as string | number | Date);
    if (Number.isNaN(parsedDate.getTime())) {
        next(new Error("Notification createdAt is invalid"));
        return;
    }

    req.body = {
        id: id.trim(),
        type: type as NotificationChannel,
        body: body.trim(),
        cta: cta.trim(),
        createdAt: parsedDate,
    } satisfies NotificationPayload;

    next();
};
