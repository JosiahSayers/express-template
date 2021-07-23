import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ValidationErrorMapper = (err: any, req: Request, res: Response, next: NextFunction): Response => {
    if (err?.error?.isJoi) {
        return res.status(400).json({
            type: err.type,
            validationErrors: err.error.message.split('. ')
        });
    } else {
        next(err);
    }
};
