import 'reflect-metadata';
import cors from 'cors';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { createConnection } from 'typeorm';
import { Environment } from './utils/environment';
import { ValidationErrorMapper } from './middleware/validation/error-response';
import { DefaultErrorResponse } from './middleware/errors/default-error';
import { HomeRouter } from './routers/home/home';
import { refreshAccessToken, validateAccessToken } from './middleware/authorization';
import { JwtService } from './services/authentication/jwt/jwt.service';
import { retry } from './utils/utility-functions';
import { UserRouter } from './routers/user/user';

export async function createApp(): Promise<Express> {
    const app = express();
    Environment.loadEnvFile();

    try {
        await retry(() => createConnection(Environment.dbConfig));
        console.log('Connected to DB');
        await JwtService.startSigningKeyUpdate();
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
    app.use('/users', UserRouter);
    
    app.use(ValidationErrorMapper);
    app.use(DefaultErrorResponse);
    
    return app;   
}
