import * as Request from '@src/libs/Request';
import type {Middleware} from '@src/libs/Request';
import type * as OnyxTypes from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
});

beforeEach(() => {
    Request.clearMiddlewares();
});

const request: OnyxTypes.Request = {
    command: 'MockCommand',
    data: {authToken: 'testToken'},
};

test('Request.use() can register a middleware and it will run', () => {
    const testMiddleware = jest.fn<Middleware, Parameters<Middleware>>();
    Request.use(testMiddleware as unknown as Middleware);

    Request.processWithMiddleware(request, true);
    return waitForBatchedUpdates().then(() => {
        const call = testMiddleware.mock.calls.at(0);
        if (!call) {
            return;
        }
        const [promise, returnedRequest, isFromSequentialQueue] = call;
        expect(testMiddleware).toHaveBeenCalled();
        expect(returnedRequest).toEqual(request);
        expect(isFromSequentialQueue).toBe(true);
        expect(promise).toBeInstanceOf(Promise);
    });
});

test('Request.use() can register two middlewares. They can pass a response to the next and throw errors', () => {
    // Given an initial middleware that returns a promise with a resolved value
    const testMiddleware = jest.fn().mockResolvedValue({
        jsonCode: 404,
    });

    // And another middleware that will throw when it sees this jsonCode
    const errorThrowingMiddleware: Middleware = (promise: Promise<void | OnyxTypes.Response>) =>
        promise.then(
            (response: void | OnyxTypes.Response) =>
                new Promise((resolve, reject) => {
                    if (typeof response === 'object' && response.jsonCode !== 404) {
                        return;
                    }

                    reject(new Error('Oops'));
                }),
        );

    Request.use(testMiddleware);
    Request.use(errorThrowingMiddleware);

    const catchHandler = jest.fn();
    Request.processWithMiddleware(request).catch(catchHandler);
    return waitForBatchedUpdates().then(() => {
        expect(catchHandler).toHaveBeenCalled();
        expect(catchHandler).toHaveBeenCalledWith(new Error('Oops'));
    });
});
