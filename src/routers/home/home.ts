import { NextFunction, Request, Response, Router } from 'express';
import { createValidator, ValidatedRequest } from 'express-joi-validation';
import { BaseRouteRequestSchema, BaseRouteRquestJoi } from '../../middleware/validation/requests/home/base-route';

const router = Router();
const validator = createValidator({ passError: true });

router.get('/', validator.query(BaseRouteRquestJoi), async (req: ValidatedRequest<BaseRouteRequestSchema>, res: Response, next: NextFunction) => {
    try {
        if (req.query.echo === 'throw') { throw new Error('Intentional'); }
        return res.send(req.query.echo || 'You provided nothing for me to echo');
    } catch (e) {
        next(e);
    }
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.message === 'Intentional') {
        return res.status(404).json({ msg: 'I caught the error!' });
    } else {
        next(err);
    }
});

export { router as HomeRouter };
