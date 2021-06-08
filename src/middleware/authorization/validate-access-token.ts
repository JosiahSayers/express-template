import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthenticationService } from '../../services/authentication/authentication.service';

export const validateAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.cookies.accessToken || req.cookies.refreshToken) {
            req.user = await AuthenticationService.verifyAccessTokenGetUser(req.cookies.accessToken);
        }
    } catch (e) {
        if (e instanceof TokenExpiredError || (e instanceof JsonWebTokenError && !req.cookies.accessToken)) {
            return next(e);
        } else {
            console.log('unable to verify access token', e);
        }
    }
    return next();
};
