import { TestRequestBuilder } from '../../utils/testing/integration/request-builder';
import { TestEnvironment } from '../../utils/testing/test-environment';
import { signInAs } from '../../utils/testing/integration/user-helper';
import { TestUsers } from '../../utils/testing/integration/test-data';
import { removeAllFromTable } from '../../utils/testing/integration/db-functions';

describe('Post Controller', () => {
    let requestBuilder: TestRequestBuilder;
    let baseRoute: string;

    beforeAll(async () => {
        TestEnvironment.loadEnvFile();
        requestBuilder = new TestRequestBuilder();
        baseRoute = `${TestEnvironment.apiBase}/posts`;
    });

    afterEach(async () => await removeAllFromTable('post'));

    describe('POST /', () => {
        it('returns an error if the user is not signed in', async () => {
            const res = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE'
            }, {
                disableCookies: true
            });
            expect(res.ok).toBe(false);
        });

        it('returns an error if the user does not have a role that can author posts', async () => {
            await signInAs(TestUsers.commenterUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE'
            });
            expect(res.ok).toBe(false);
        });

        it('returns an error if the title is not set', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {});
            expect(res.ok).toBe(false);
        });

        it('returns an error if the title is not a string', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 42
            });
            expect(res.ok).toBe(false);
        });

        it('returns an error if "body" is not a string', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE',
                body: 42
            });
            expect(res.ok).toBe(false);
        });

        it('returns an error if "tags" is not a string array', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE',
                tags: 'NOT AN ARRAY'
            });
            const res2 = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE',
                tags: [1, 2, 3]
            });
            expect(res.ok).toBe(false);
            expect(res2.ok).toBe(false);
        });

        it('returns an error if "publishedAt" is not an iso formatted string', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE',
                publishedAt: 'NOT AN ISO STRING'
            });
            expect(res.ok).toBe(false);
        });

        it('returns an error if "published" is not a boolean', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'TEST TITLE',
                published: 'true'
            });
            expect(res.ok).toBe(false);
        });

        it('adds the post when the minimum required fields are passed', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'NEW POST'
            });
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody).toMatchObject({
                title: 'NEW POST',
                slug: 'new-post'
            });
        });

        it('adds an integer to the end of the slug when creating a post with a title that already exists', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const res = await requestBuilder.post(baseRoute, {
                title: 'SEQUENTIAL POST'
            });
            const res2 = await requestBuilder.post(baseRoute, {
                title: 'SEQUENTIAL POST'
            });
            expect(res.ok).toBe(true);
            expect(res2.ok).toBe(true);
            expect((await res.json()).slug).toBe('sequential-post');
            expect((await res2.json()).slug).toBe('sequential-post-2');
        });

        it('adds the post if the request passes validation', async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const publishDate = new Date().toISOString();
            const res = await requestBuilder.post(baseRoute, {
                title: 'FULL POST',
                body: 'This is the body of the blog post.',
                tags: ['epic', 'blog', 'post'],
                publishedAt: publishDate,
                published: true
            });
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(resBody).toMatchObject({
                title: 'FULL POST',
                slug: 'full-post',
                body: 'This is the body of the blog post.',
                tags: ['epic', 'blog', 'post'],
                publishedAt: publishDate,
                published: true
            });
        });
    });

    describe('DELETE /', () => {
        let postSlug: string;

        beforeEach(async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const newPost = await requestBuilder.post(baseRoute, {
                title: 'TEST',
                published: true
            });
            postSlug = (await newPost.json()).slug;
        });

        it('returns an error if the user is not signed in', async () => {
            const res = await requestBuilder.delete(`${baseRoute}/${postSlug}`, {
                disableCookies: true
            });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });

        it('returns an error if the user is not eligible to author a post', async () => {
            await signInAs(TestUsers.commenterUser, requestBuilder);
            const res = await requestBuilder.delete(`${baseRoute}/${postSlug}`);
            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);

            await signInAs(TestUsers.viewerUser, requestBuilder);
            const res2 = await requestBuilder.delete(`${baseRoute}/${postSlug}`);
            expect(res2.ok).toBe(false);
            expect(res2.status).toBe(401);
        });

        it('returns a 404 if the slug cannot be found', async () => {
            const res = await requestBuilder.delete(`${baseRoute}/random-not-valid-slug`);
            expect(res.ok).toBe(false);
            expect(res.status).toBe(404);
        });

        it('returns a success if an editor tries to delete a valid slug', async () => {
            const res = await requestBuilder.delete(`${baseRoute}/${postSlug}`);
            expect(res.ok).toBe(true);
            expect(res.status).toBe(200);
        });

        it('returns a success if an admin tries to delete a valid slug', async () => {
            await signInAs(TestUsers.adminUser, requestBuilder);
            const res = await requestBuilder.delete(`${baseRoute}/${postSlug}`);
            expect(res.ok).toBe(true);
            expect(res.status).toBe(200);
        });

        it('does not return a deleted post in subsequent get requests', async () => {
            const beforeDeleteRes = await requestBuilder.get(baseRoute);
            const beforeDeleteResBody = await beforeDeleteRes.json();
            expect(beforeDeleteResBody.posts).toHaveLength(1);
            await requestBuilder.delete(`${baseRoute}/${postSlug}`);
            const res = await requestBuilder.get(baseRoute);
            const resBody = await res.json();
            expect(resBody.posts).toHaveLength(0);
        });
    });

    describe('GET /archived', () => {
        let postSlug: string;

        beforeEach(async () => {
            await signInAs(TestUsers.editorUser, requestBuilder);
            const newPost = await requestBuilder.post(baseRoute, {
                title: 'TEST',
                published: true
            });
            postSlug = (await newPost.json()).slug;
            await requestBuilder.delete(`${baseRoute}/${postSlug}`);
        });

        it('returns an error if the user is not signed in', async () => {
            const res = await requestBuilder.get(`${baseRoute}/archived`, {
                disableCookies: true
            });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);
        });

        it('returns an error if the user is not eligible to author a post', async () => {
            await signInAs(TestUsers.commenterUser, requestBuilder);
            const res = await requestBuilder.get(`${baseRoute}/archived`);
            expect(res.ok).toBe(false);
            expect(res.status).toBe(401);

            await signInAs(TestUsers.viewerUser, requestBuilder);
            const res2 = await requestBuilder.get(`${baseRoute}/archived`);
            expect(res2.ok).toBe(false);
            expect(res2.status).toBe(401);
        });

        it('returns all of the archived posts', async () => {
            const res = await requestBuilder.get(`${baseRoute}/archived`);
            const resBody = await res.json();
            expect(res.ok).toBe(true);
            expect(res.status).toBe(200);
            expect(resBody.posts).toHaveLength(1);
            expect(resBody.posts[0].slug).toBe(postSlug);
        });
    });
});
