import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';
import Joi from 'joi';

export const BaseRouteRquestJoi = Joi.object({
    echo: Joi.string().optional().default('')
});

export interface BaseRouteRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        echo: string;
    }
}
