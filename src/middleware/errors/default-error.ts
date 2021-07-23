import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DefaultErrorResponse = (err: unknown, req: Request, res: Response, next: NextFunction): Response => {
    console.error(err);
    return res.status(500).send({ msg: 'Server error, please try again.' });
};
