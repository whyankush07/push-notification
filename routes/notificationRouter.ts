import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { Queue } from "../queue/redis";
import type { NotificationPayload } from "../types/payload";
import { validateNotificationPayload } from "../validators/notificationValidator";
import { DB } from "../db/pg";

const notificationRouter = (queue: Queue, db: DB) => {
    const router = Router();
    const controller = new NotificationController(queue, db);

    router.post("/", validateNotificationPayload, async (req, res) => {
        try {
            const payload = req.body as NotificationPayload;
            const queuedId = await controller.handleNotification(payload);

            if (!queuedId) {
                res.status(500).json({
                    success: false,
                    message: "Failed to queue notification",
                });
                return;
            }

            res.status(202).json({
                success: true,
                message: "Notification queued successfully",
                data: {
                    id: payload.id,
                    type: payload.type,
                    createdAt: payload.createdAt,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to process notification";
            res.status(500).json({
                success: false,
                message,
            });
        }
    });

    return router;
};

export default notificationRouter;