/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRole } from '../../models/db/user.model';
import { TestEnvironment } from '../../utils/testing/test-environment';
import { TestRequestBuilder } from '../../utils/testing/integration/request-builder';
import { signInAs } from '../../utils/testing/integration/user-helper';
import { TestUsers } from '../../utils/testing/integration/test-data';
import { TestDataHelper } from '../../utils/testing/integration/test-data-helper';

describe('User Router', () => {
    let requestBuilder: TestRequestBuilder;
    let baseRoute: string;
    let route: string;
    let testUser: {
        name: string;
        email: string;
        password: string;
    };

    beforeAll(async () => {
        requestBuilder = new TestRequestBuilder();
        testUser = {
            name: 'NAME',
            email: 'EMAIL@EMAIL.COM',
            password: 'PASSWORD'
        };
        await TestDataHelper.sharedSetup();
        baseRoute = `${TestEnvironment.apiBase}/users`;
    });

    afterAll(async () => {
        await TestDataHelper.sharedTeardown();
    });

    describe('POST /register', () => {
        beforeAll(() => route = `${baseRoute}/register`);

        it('returns an error if a valid email is not sent in the body', async () => {
            const invalidEmails = [
                '',
                '    ',
                'john@email',
                'johnemail.com',
                'yahoo.com'
            ];
            for (const email of invalidEmails) {
                const requestBody = { ...testUser, email };
                const res = await requestBuilder.post(route, requestBody);
                const resBody = await res.json();
                expect(res.ok).toBe(false);
                expect(res.status).toBe(400);
                expect(resBody.type).toBe('body');
            }
        });

        it('returns an error if a valid name is not sent in the body', async () => {
            const requestBody = { ...testUser, name: '' };
            const res = await requestBuilder.post(route, requestBody);
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if the name includes forbidden characters', async () => {
            const requestBody = { ...testUser, name: 'John : Smith' };
            const res = await requestBuilder.post(route, requestBody);
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if the name is longer than 25 characters', async () => {
            const requestBody = { ...testUser, name: 'John Michael Bubble Smith Rhodes' };
            const res = await requestBuilder.post(route, requestBody);
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if a valid password is not sent in the body', async () => {
            const requestBody = { ...testUser, password: '' };
            const res = await requestBuilder.post(route, requestBody);
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if a password less than 8 characters is sent in the body', async () => {
            const requestBody = { ...testUser, password: 'shortie' };
            const res = await requestBuilder.post(route, requestBody);
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('successfully registers a new user', async () => {
            const res = await requestBuilder.post(route, testUser);
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody).toMatchObject({
                email: testUser.email.toLowerCase(),
                name: testUser.name,
                role: 'standard'
            });
        });
    });

    describe('GET /profile', () => {
        beforeAll(() => route = `${baseRoute}/profile`);

        it('returns an error if the user is not logged in', async () => {
            const res = await requestBuilder.get(route, { disableCookies: true });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });

        it('successfully returns the logged in user\'s profile', async () => {
            const res = await requestBuilder.get(route);
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody).toMatchObject({
                name: testUser.name,
                email: testUser.email.toLowerCase(),
                role: UserRole.STANDARD
            });
            expect(resBody).toHaveProperty('id');
        });
    });

    describe('POST /sign-in', () => {
        beforeAll(() => route = `${baseRoute}/sign-in`);

        it('returns an error if the email is empty', async () => {
            const res = await requestBuilder.post(route, { email: '', password: testUser.password });
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if the email is not a string', async () => {
            const res = await requestBuilder.post(route, { email: true, password: testUser.password });
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if the email is not found', async () => {
            const res = await requestBuilder.post(route, { email: 'unknown@email.com', password: testUser.password });
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(404);
            expect(resBody).toEqual({ msg: 'Email not found' });
        });

        it('returns an error if the password is empty', async () => {
            const res = await requestBuilder.post(route, { email: testUser.email, password: '' });
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if the password is not a string', async () => {
            const res = await requestBuilder.post(route, { email: testUser.email, password: 3 });
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody.type).toBe('body');
        });

        it('returns an error if the password is not correct', async () => {
            const res = await requestBuilder.post(route, { email: testUser.email, password: 'wrong password' });
            const resBody = await res.json();
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
            expect(resBody).toEqual({ msg: 'Invalid Password' });
        });

        it('successfully logs in the user', async () => {
            const res = await requestBuilder.post(route, { email: testUser.email, password: testUser.password });
            expect(res.ok).toBe(true);
            expect(res.status).toBe(200);
        });
    });

    describe('POST /sign-out', () => {
        beforeAll(() => route = `${baseRoute}/sign-out`);

        it('removes the accessToken and refreshToken cookies', async () => {
            const res = await requestBuilder.post(route);
            expect(res.headers.get('Set-Cookie').includes('accessToken=;')).toBe(true);
            expect(res.headers.get('Set-Cookie').includes('refreshToken=;')).toBe(true);
        });

        afterEach(async () => await requestBuilder.post(`${baseRoute}/sign-in`, { email: testUser.email, password: testUser.password }));
    });

    describe('DELETE /', () => {
        it('successfully deletes the logged in user', async () => {
            const res = await requestBuilder.delete(baseRoute);
            expect(res.ok).toBe(true);
            expect(res.status).toBe(204);
        });
    });

    describe('GET /', () => {
        const url = (searchQuery: string) => `${baseRoute}?query=${searchQuery}`;

        it('returns an unauthorized error if the user is not an admin', async () => {
            const responses = [];
            await signInAs(TestUsers.standardUser, requestBuilder);
            responses.push(await requestBuilder.get(url('anything')));
            responses.push(await requestBuilder.get(url('anything'), { disableCookies: true }));
            expect(responses.every((res) => !res.ok && res.status === 401)).toBe(true);
        });

        it('searches the query string against the name property', async () => {
            await signInAs(TestUsers.adminUser, requestBuilder);
            const res = await requestBuilder.get(url(TestUsers.adminUser.name));
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody.users[0]).toMatchObject({
                name: TestUsers.adminUser.name,
                email: TestUsers.adminUser.email,
                role: TestUsers.adminUser.role
            });
            expect(resBody.users[0]).toHaveProperty('id');
            expect(resBody).toHaveProperty('totalMatched');
            expect(typeof resBody.totalMatched).toBe('number');
        });

        it('searches the query against the email property', async () => {
            await signInAs(TestUsers.adminUser, requestBuilder);
            const res = await requestBuilder.get(url(TestUsers.standardUser.email));
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody.users[0]).toMatchObject({
                name: TestUsers.standardUser.name,
                email: TestUsers.standardUser.email,
                role: TestUsers.standardUser.role
            });
            expect(resBody.users[0]).toHaveProperty('id');
            expect(resBody).toHaveProperty('totalMatched');
            expect(typeof resBody.totalMatched).toBe('number');
        });

        it('returns the expected response when there are no matches found', async () => {
            await signInAs(TestUsers.adminUser, requestBuilder);
            const res = await requestBuilder.get(url('some string that should not return results'));
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody).toEqual({
                users: [],
                totalMatched: 0
            });
        });
    });

    describe('PATCH /:id', () => {
        const url = (id: string) => `${baseRoute}/${id}`;

        beforeEach(async () => await signInAs(TestUsers.adminUser, requestBuilder));

        it('returns an unauthorized error if the user is not an admin', async () => {
            const responses = [];
            await signInAs(TestUsers.standardUser, requestBuilder);
            responses.push(await requestBuilder.patch(url('anything')));
            responses.push(await requestBuilder.patch(url('anything'), { disableCookies: true }));
            expect(responses.every((res) => !res.ok)).toBe(true);
            expect(responses.every((res) => res.status === 401)).toBe(true);
        });

        it('returns an error if the body does not define a role', async () => {
            const res = await requestBuilder.patch(url('anything'), { role: undefined });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
        });

        it('returns an error if the body does not define a valid role', async () => {
            const res = await requestBuilder.patch(url('anything'), { role: 'invalid role' });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(400);
        });

        it('returns a 404 error if the user id cannot be found', async () => {
            const res = await requestBuilder.patch(url('unknown id'), { role: 'admin' });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(404);
        });

        it('successfully changes a user\'s role', async () => {
            await signInAs(TestUsers.standardUser, requestBuilder);
            const viewer = await (await requestBuilder.get(`${baseRoute}/profile`)).json();
            await signInAs(TestUsers.adminUser, requestBuilder);
            const res = await requestBuilder.patch(url(viewer.id), { role: 'admin' });
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody).toEqual({
                ...viewer,
                role: 'admin'
            });

            // cleanup
            await requestBuilder.patch(url(viewer.id), { role: viewer.role });
        });
    });
});
