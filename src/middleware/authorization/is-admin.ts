import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../../models/db/user.model';

export const isAdmin = (req: Request, res: Response, next: NextFunction): any => 
    req.user.role === UserRole.ADMIN ? next() : res.status(401).json({ msg: 'User is not authorized for this action' });
