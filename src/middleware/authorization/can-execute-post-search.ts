import { NextFunction, Response } from 'express';
import { ValidatedRequest } from 'express-joi-validation';
import { GetPostsRequestSchema } from '../../models/api/requests/post/get-posts';


export const canExecutePostSearch = async (req: ValidatedRequest<GetPostsRequestSchema>, res: Response, next: NextFunction): Promise<any> => {
    if ((req.query.isForEditorView || req.query.published === false) && !req.user?.canEditPosts) {
        return res.status(401).json({ msg: 'User is not authorized for this action' });
    } else {
        return next();
    }
};
