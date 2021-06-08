import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import Joi from 'joi';

export const RegisterRequestJoi = Joi.object({
    name: Joi.string().required().trim().min(1).max(25).messages({ name: 'name can only contain letters and whitespace' }).custom((value: string, helpers: Joi.CustomHelpers) => /^[a-zA-Z][a-zA-Z\s]*$/.test(value) ? value : helpers.error('name')),
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().required().min(8)
});

export interface RegisterRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string,
        email: string,
        password: string
    }
}
