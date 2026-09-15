import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

export class DB {
    client: Pool;

    constructor(dbUrl: string) {
        this.client = new Pool({
            connectionString: dbUrl,
            max: 10,
            idleTimeoutMillis: 30000
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
}