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

const request: OnyxTypes.Request<any> = {
    command: 'MockCommand',
    data: {authToken: 'testToken'},
};

test('Request.addMiddleware() can register a middleware and it will run', () => {
    const testMiddleware = jest.fn<Middleware, Parameters<Middleware>>();
    Request.addMiddleware(testMiddleware as unknown as Middleware);

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

test('Request.addMiddleware() can register two middlewares. They can pass a response to the next and throw errors', () => {
    // Given an initial middleware that returns a promise with a resolved value
    const testMiddleware = jest.fn().mockResolvedValue({
        jsonCode: 404,
    });

    // And another middleware that will throw when it sees this jsonCode
    const errorThrowingMiddleware: Middleware = (promise) =>
        promise.then((response) => {
            if (typeof response === 'object' && response.jsonCode !== 404) {
                // Pass the response through to the next middleware
                return response;
            }
            // Reject so the chain receives an error
            throw new Error('Oops');
        });

    Request.addMiddleware(testMiddleware);
    Request.addMiddleware(errorThrowingMiddleware);

    const catchHandler = jest.fn();
    Request.processWithMiddleware(request).catch(catchHandler);
    return waitForBatchedUpdates().then(() => {
        expect(catchHandler).toHaveBeenCalled();
        expect(catchHandler).toHaveBeenCalledWith(new Error('Oops'));
    });
});
