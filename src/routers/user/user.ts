import { NextFunction, Request, Response, Router } from 'express';
import { createValidator, ValidatedRequest } from 'express-joi-validation';
import { isSignedIn, isAdmin } from '../../middleware/authorization';
import { AdminEditUserJoi, AdminEditUserRequestSchema } from '../../middleware/validation/requests/user/admin-edit-user';
import { GetUsersRequestJoi, GetUsersRequestSchema } from '../../middleware/validation/requests/user/get-users';
import { RegisterRequestJoi, RegisterRequestSchema } from '../../middleware/validation/requests/user/register';
import { SignInRequestJoi, SignInRequestSchema } from '../../middleware/validation/requests/user/sign-in';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { EmailExistsError, EmailNotFoundError, InvalidPasswordError, RateLimitError, UserDisabledError, UserNotFoundError } from '../../models/errors/authentication.errors';
import { setAuthCookies, clearAuthCookies } from './user-helper';

const router = Router();
const validator = createValidator({ passError: true });

router.get('/', isSignedIn, isAdmin, validator.query(GetUsersRequestJoi), async (req: ValidatedRequest<GetUsersRequestSchema>, res: Response, next: NextFunction) => {
    try {
        return res.json(await AuthenticationService.findUsersBySearch(req.query.query));
    } catch (e) {
        next(e);
    }   
});

router.get('/profile', isSignedIn, (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.json(req.user.createProfileObject({ includeRole: true }));
    } catch (e) {
        next(e);
    }
});

router.post('/register', validator.body(RegisterRequestJoi), async (req: ValidatedRequest<RegisterRequestSchema>, res: Response, next: NextFunction) => {
    try {
        const authRes = await AuthenticationService.register(req.body);
        setAuthCookies(authRes, res);
        return res.json(authRes.user);
    } catch (e) {
        next(e);
    }
});

router.post('/sign-in', validator.body(SignInRequestJoi), async (req: ValidatedRequest<SignInRequestSchema>, res: Response, next: NextFunction) => {
    try {
        const authRes = await AuthenticationService.signIn(req.body);
        setAuthCookies(authRes, res);
        return res.json(authRes.user);
    } catch (e) {
        next(e);
    }
});

router.post('/sign-out', async (req: Request, res: Response, next: NextFunction) => {
    try {
        clearAuthCookies(res);
        return res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

router.delete('/', isSignedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {
        clearAuthCookies(res);
        await AuthenticationService.deleteUser(req.user);
        return res.sendStatus(204);
    } catch (e) {
        next(e);
    }
});

router.patch('/:id', isSignedIn, isAdmin, validator.body(AdminEditUserJoi), async (req: ValidatedRequest<AdminEditUserRequestSchema>, res: Response, next: NextFunction) => {
    try {
        return res.json(await AuthenticationService.updateUser(req.params.id, req.body));
    } catch (e) {
        next(e);
    }
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof EmailExistsError) {
        return res.status(400).json({ msg: 'Email already exists' });
    } else if (err instanceof RateLimitError) {
        return res.status(429).json({ msg: 'Too many attempts' });
    } else if (err instanceof EmailNotFoundError) {
        return res.status(404).json({ msg: 'Email not found' });
    } else if (err instanceof InvalidPasswordError) {
        return res.status(400).json({ msg: 'Invalid Password' });
    } else if (err instanceof UserDisabledError) {
        return res.status(403).json({ msg: 'This account has been disabled' });
    } else if (err instanceof UserNotFoundError) {
        return res.status(404).json({ msg: 'User not found' });
    } else {
        return next(err);
    }
});

export { router as UserRouter };
