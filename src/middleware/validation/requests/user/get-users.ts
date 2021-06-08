import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import Joi from 'joi';

export const GetUsersRequestJoi = Joi.object({
    query: Joi.string().trim().optional()
});

export interface GetUsersRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        query: string;
    }
}
