import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';
import * as entities from '../models/db';

export class Environment {
    static loadEnvFile(): void {
        if (process.env.NODE_ENV === 'testing') {
            dotenv.config({ path: 'env/testing.env'});
        } else if (process.env.NODE_ENV !== 'production') {
            dotenv.config({ path: 'env/.env' });
        }
    }

    static get isProduction(): boolean {
        return process.env.NODE_ENV === 'production';
    }

    static get isTesting(): boolean {
        return process.env.NODE_ENV === 'testing';
    }

    static get port(): string {
        return process.env.PORT ?? '';
    }

    static get dbConfig(): ConnectionOptions {
        return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: this.isProduction ? {
                rejectUnauthorized: false
            } : null,
            entities: [...Object.values(entities)],
            synchronize: !Environment.isProduction
        };
    }
}
