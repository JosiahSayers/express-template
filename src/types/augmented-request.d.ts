import { User } from '../models/db';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
