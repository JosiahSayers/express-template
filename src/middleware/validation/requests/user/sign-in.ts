import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import Joi from 'joi';

export const SignInRequestJoi = Joi.object({
    email: Joi.string().lowercase().required(),
    password: Joi.string().required()
});

export interface SignInRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        email: string,
        password: string
    }
}
