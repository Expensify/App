import * as Request from '@src/libs/Request';
import type {Middleware} from '@src/libs/Request';
import type * as OnyxTypes from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Network/NetworkStore', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = jest.requireActual<typeof import('@src/libs/Network/NetworkStore')>('@src/libs/Network/NetworkStore');
    return {
        ...actual,
        hasReadRequiredDataFromStorage: jest.fn(() => Promise.resolve()),
    };
});

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
});

beforeEach(() => {
    Request.clearMiddlewares();
});

const request: OnyxTypes.AnyRequest = {
    command: 'MockCommand',
    data: {authToken: 'testToken'},
};

test('Request.addMiddleware() can register a middleware and it will run', () => {
    const testMiddleware = jest.fn<Middleware, Parameters<Middleware>>();
    Request.addMiddleware(testMiddleware as unknown as Middleware, 'TestMiddleware');

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
    const testMiddleware = jest.fn().mockResolvedValue({
        jsonCode: 404,
    });

    const errorThrowingMiddleware: Middleware = (promise) =>
        promise.then((response) => {
            if (typeof response === 'object' && response.jsonCode !== 404) {
                return response;
            }
            throw new Error('Oops');
        });

    Request.addMiddleware(testMiddleware, 'TestMiddleware');
    Request.addMiddleware(errorThrowingMiddleware, 'ErrorThrowingMiddleware');

    const catchHandler = jest.fn();
    Request.processWithMiddleware(request).catch(catchHandler);

    return waitForBatchedUpdates()
        .then(waitForBatchedUpdates)
        .then(() => {
            expect(catchHandler).toHaveBeenCalled();
            expect(catchHandler).toHaveBeenCalledWith(new Error('Oops'));
        });
});
