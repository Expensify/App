import CONST from '@src/CONST';
import Log from '@src/libs/Log';
import * as Request from '@src/libs/Request';
import type {Middleware} from '@src/libs/Request';
import type * as OnyxTypes from '@src/types/onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), alert: jest.fn(), warn: jest.fn(), hmmm: jest.fn()},
}));

// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock doesn't rely on `this` binding
const mockLogAlert = jest.mocked(Log.alert);

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
});

beforeEach(() => {
    Request.clearMiddlewares();
    jest.clearAllMocks();
});

const request: OnyxTypes.AnyRequest = {
    command: 'MockCommand',
    data: {authToken: 'testToken'},
};

test('Request.addMiddleware() can register a middleware and it will run', () => {
    const testMiddleware = jest.fn<ReturnType<Middleware>, Parameters<Middleware>>().mockResolvedValue(undefined);
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

test('Request.processWithMiddleware() normalizes a non-Error rejection into an Error with command context and alerts', () => {
    // Given a middleware that rejects with a bare `null` instead of an Error (the APP-5J scenario)
    // eslint-disable-next-line prefer-promise-reject-errors
    const nullRejectingMiddleware: Middleware = () => Promise.reject(null);
    Request.addMiddleware(nullRejectingMiddleware);

    // When the request is processed, the rejection should surface as a real Error carrying the command name
    return expect(Request.processWithMiddleware(request))
        .rejects.toThrow('[API] MockCommand rejected: null')
        .then(() => {
            // And an alert should be logged with the command context for diagnosis
            expect(mockLogAlert).toHaveBeenCalledWith(`${CONST.ERROR.ENSURE_BUG_BOT} non-Error rejection surfaced from the request pipeline`, {command: 'MockCommand', reason: 'null'});
        });
});

test('Request.processWithMiddleware() passes real Error rejections through untouched without alerting', () => {
    // Given a middleware that rejects with a proper Error (already normalized by the Logging middleware)
    const originalError = new Error('Oops');
    const errorRejectingMiddleware: Middleware = () => Promise.reject(originalError);
    Request.addMiddleware(errorRejectingMiddleware);

    const catchHandler = jest.fn<void, [unknown]>();
    return Request.processWithMiddleware(request)
        .catch(catchHandler)
        .then(() => {
            // Then the exact same Error instance reaches the caller and no alert is raised
            expect(catchHandler).toHaveBeenCalledTimes(1);
            expect(catchHandler.mock.calls.at(0)?.at(0)).toBe(originalError);
            expect(mockLogAlert).not.toHaveBeenCalled();
        });
});
