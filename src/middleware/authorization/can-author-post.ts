import { NextFunction, Request, Response } from 'express';

export const canAuthorPost = (req: Request, res: Response, next: NextFunction): any => 
    req.user.canEditPosts ? next() : res.status(401).json({ msg: 'User is not authorized for this action' });
