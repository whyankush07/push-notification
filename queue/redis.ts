import Redis from "ioredis";

interface config {
    ios_queue_url: string;
    android_queue_url: string;
    sms_queue_url: string;
    mail_queue_url: string;
}

export class Queue {
    private ios_queue: Redis;
    private android_queue: Redis;
    private sms_queue: Redis;
    private mail_queue: Redis;

    constructor(cfg: config) {
        this.ios_queue = new Redis(cfg.ios_queue_url);
        this.android_queue = new Redis(cfg.android_queue_url);
        this.sms_queue = new Redis(cfg.sms_queue_url);
        this.mail_queue = new Redis(cfg.mail_queue_url);
    }

    getIOSQueue(): Redis {
        return this.ios_queue;
    }

    getAndroidQueue(): Redis {
        return this.android_queue;
    }

    getSMSQueue(): Redis {
        return this.sms_queue;
    }

    getMailQueue(): Redis {
        return this.mail_queue;
    }
}