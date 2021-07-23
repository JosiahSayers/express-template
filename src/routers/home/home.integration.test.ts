import { TestRequestBuilder } from '../../utils/testing/integration/request-builder';
import { TestDataHelper } from '../../utils/testing/integration/test-data-helper';
import { TestEnvironment } from '../../utils/testing/test-environment';

describe('Home Router', () => {
    let requestBuilder: TestRequestBuilder;
    let baseRoute: string;

    beforeAll(async () => {
        requestBuilder = new TestRequestBuilder();
        await TestDataHelper.sharedSetup();
        baseRoute = TestEnvironment.apiBase;
    });

    afterAll(async () => {
        await TestDataHelper.sharedTeardown();
    });

    describe('GET /', () => {
        it('returns the correct string when no echo param is passed', async () => {
            const res = await requestBuilder.get(baseRoute);
            const json = await res.json();
            expect(json.echo).toBe('You provided nothing for me to echo');
        });

        it('returns the correct string when an echo param is passed', async () => {
            const res = await requestBuilder.get(`${baseRoute}?echo=this_should_be_returned`);
            const json = await res.json();
            expect(json.echo).toBe('this_should_be_returned');
        });

        it('returns the response from the error handler when passed "throw"', async () => {
            const res = await requestBuilder.get(`${baseRoute}?echo=throw`);
            const json = await res.json();
            expect(json).toEqual({ msg: 'I caught the error!' });
        });
    });
});
