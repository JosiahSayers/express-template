import { TestEnvironment } from '../test-environment';
import { TestRequestBuilder } from './request-builder';

export const signInAs = async (user: { email: string, password: string, [key: string]: any }, requestBuilder: TestRequestBuilder): Promise<void> => {
    await requestBuilder.post(`${TestEnvironment.apiBase}/users/sign-in`, { email: user.email, password: user.password });
};
