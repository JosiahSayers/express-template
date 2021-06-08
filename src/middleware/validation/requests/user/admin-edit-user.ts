import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import Joi from 'joi';
import { UserRole } from '../../../../models/db/user.model';

export const AdminEditUserJoi = Joi.object({
    role: Joi.string().trim().required().valid(...Object.values(UserRole))
});

export interface AdminEditUserRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        role: UserRole;
    }
}
