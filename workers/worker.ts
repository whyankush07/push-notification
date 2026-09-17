import { loadConfig } from "../config/config";
import { DB } from "../db/pg";
import { Queue } from "../queue/redis";
import { NotificationWorker } from "./notificationWorker";

const cfg = loadConfig();
const db = new DB(cfg.pgUrl);
const q = new Queue(cfg.redisUrl);
const worker = new NotificationWorker(q, db);

console.log("Notification worker started");
void worker.start();
