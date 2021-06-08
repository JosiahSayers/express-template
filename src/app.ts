import 'reflect-metadata';
import cors from 'cors';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { createConnection, getRepository } from 'typeorm';
import { Environment } from './utils/environment';
import { ValidationErrorMapper } from './middleware/validation/error-response';
import { DefaultErrorResponse } from './middleware/errors/default-error';
import { HomeRouter } from './routers/home/home';
import { refreshAccessToken, validateAccessToken } from './middleware/authorization';
import { User } from './models/db';
import { UserRole } from './models/db/user.model';
import { JwtService } from './services/authentication/jwt/jwt.service';
import { createUsersForTests } from './utils/testing/integration/test-data';

export async function createApp(): Promise<Express> {
    Environment.loadEnvFile();
    
    const app = express();

    try {
        await retry(() => createConnection(Environment.dbConfig));
        console.log('Connected to DB');
        await JwtService.startSigningKeyUpdate();
        if (Environment.isTesting) {
            await createUsersForTests();
        }
    } catch (e) {
        console.log('Unable to connect to db', e);
        process.exit(1);
    }
    
    app.set('port', Environment.port);
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors());
    app.use('*', validateAccessToken, refreshAccessToken);
    
    app.use('/', HomeRouter);
    
    app.use(ValidationErrorMapper);
    app.use(DefaultErrorResponse);
    
    return app;   
}

async function retry(func: () => any): Promise<void> {
    let tries = 1;
    let successful = false;

    do {
        try {
            await func();
            successful = true;
        } catch (e) {
            console.log(e);
            tries++;
            await new Promise((resolve) => setTimeout(() => resolve(''), 5000));
        }
    } while (tries < 5 && !successful);

    if (!successful) {
        throw new Error('Not able to successfully complete function within 5 tries');
    }
}
