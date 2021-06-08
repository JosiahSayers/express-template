import { TokenResponse } from '../../services/authentication/authentication.service';
import { Response } from 'express';
import { Environment } from '../../utils/environment';

export function setAuthCookies(authRes: TokenResponse, res: Response): void {
    const cookieExpiration = new Date();
    cookieExpiration.setFullYear(new Date().getFullYear() + 1);
    res.cookie('accessToken', authRes.idToken, { httpOnly: !Environment.isTesting, sameSite: true, secure: Environment.isProduction });
    res.cookie('refreshToken', authRes.refreshToken, { httpOnly: !Environment.isTesting, sameSite: true, secure: Environment.isProduction, expires: cookieExpiration });
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
}
