interface Config {
    PORT: number;
    redisUrl: string;
    pgUrl: string;
}

export function loadConfig(): Config {
    const PORT = Number(process.env["PORT"]);
    const redisUrl = process.env["REDIS_URL"];
    const pgUrl = process.env["POSTGRES_URL"];

    if (!PORT || !redisUrl || !pgUrl) {
        throw new Error("Config file is missing some parameteres");
    }

    return {
        PORT,
        redisUrl,
        pgUrl
    }
}