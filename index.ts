import express from "express";
import rateLimit from "express-rate-limit";
import { loadConfig } from "./config/config";
import { DB } from "./db/pg";
import { Queue } from "./queue/redis";
import notificationRouter from "./routes/notificationRouter";

const app = express();
const cfg = loadConfig();

const db = new DB(cfg.pgUrl);
const q = new Queue(cfg.redisUrl);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests",
    },
});

app.use(express.json());
app.use(limiter);
app.use("/api/v1/notify", notificationRouter(q, db));

app.listen(cfg.PORT, () => {
    console.log(`Server is running on ${cfg.PORT}`);
});