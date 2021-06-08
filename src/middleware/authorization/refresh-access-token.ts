import { Request, Response, NextFunction } from 'express';
import { setAuthCookies } from '../../routers/user/user-helper';
import { AuthenticationService } from '../../services/authentication/authentication.service';

export const refreshAccessToken = async (err: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (err) {
        try {
            const authResponse = await AuthenticationService.exchangeRefreshTokenForAccessToken(req.cookies.refreshToken);
            setAuthCookies(authResponse, res);
            req.user = authResponse.user;
        } catch (e) {
            console.error('Unable to refresh access token', e);
        }
    }
    return next();
};
