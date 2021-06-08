import { NextFunction, Request, Response } from 'express';

export const isSignedIn = (req: Request, res: Response, next: NextFunction): any =>
    req.user ? next() : res.status(401).json({ msg: 'User must be signed in for this action' });
