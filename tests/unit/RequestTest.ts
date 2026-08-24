import CONST from '@src/CONST';
import {READ_COMMANDS, WRITE_COMMANDS} from '@src/libs/API/types';
import Log from '@src/libs/Log';
import * as Request from '@src/libs/Request';
import type {Middleware} from '@src/libs/Request';
import {endSpan, endSpanWithAttributes, startSpan} from '@src/libs/telemetry/activeSpans';
import type * as OnyxTypes from '@src/types/onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), alert: jest.fn(), warn: jest.fn(), hmmm: jest.fn()},
}));

jest.mock('@src/libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn(),
    endSpan: jest.fn(),
    endSpanWithAttributes: jest.fn(),
    cancelSpan: jest.fn(),
}));

const MOCK_REQUEST_ID = 'req-123';

// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock doesn't rely on `this` binding
const mockLogAlert = jest.mocked(Log.alert);
const mockStartSpan = jest.mocked(startSpan);
const mockEndSpan = jest.mocked(endSpan);
const mockEndSpanWithAttributes = jest.mocked(endSpanWithAttributes);

beforeAll(() => {
    global.fetch = TestHelper.getGlobalFetchMock({json: () => Promise.resolve({jsonCode: 200, requestID: MOCK_REQUEST_ID})});
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
    let middlewareCallCount = 0;
    const testMiddleware: Middleware = (promise, returnedRequest, isFromSequentialQueue) => {
        middlewareCallCount++;
        expect(returnedRequest).toEqual(request);
        expect(isFromSequentialQueue).toBe(true);
        expect(promise).toBeInstanceOf(Promise);
        return Promise.resolve();
    };
    Request.addMiddleware(testMiddleware);

    Request.processWithMiddleware(request, true);
    return waitForBatchedUpdates().then(() => {
        expect(middlewareCallCount).toBe(1);
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
            expect(mockLogAlert).toHaveBeenCalledWith('[API] non-Error rejection surfaced from the request pipeline', {command: 'MockCommand', reason: 'null'});
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

test('Request.processWithMiddleware() measures the request phases for measured commands only', () => {
    // Given a Search request, which is in MEASURED_REQUEST_PHASE_COMMANDS
    return Request.processWithMiddleware({command: READ_COMMANDS.SEARCH, data: {authToken: 'testToken'}}).then(() => {
        // Then every phase around the network call and the Onyx apply is opened under the SearchData names, and each one is closed again
        const startedSpanIds = mockStartSpan.mock.calls.map(([spanId]) => spanId);
        const endedSpanIds = [...mockEndSpan.mock.calls, ...mockEndSpanWithAttributes.mock.calls].map(([spanId]) => spanId);
        const measuredPhases = [CONST.TELEMETRY.SPAN_SEARCH_DATA.WAIT, CONST.TELEMETRY.SPAN_SEARCH_DATA.DOWNLOAD, CONST.TELEMETRY.SPAN_SEARCH_DATA.APPLY];
        expect(measuredPhases.filter((phase) => startedSpanIds.some((spanId) => spanId.startsWith(`${phase}_`)))).toEqual(measuredPhases);
        expect([...endedSpanIds].sort()).toEqual([...startedSpanIds].sort());

        // And the server's requestID is stamped on the phases that can see it, so one attempt's spans can be joined in Sentry
        const applySpanId = startedSpanIds.find((spanId) => spanId.startsWith(`${CONST.TELEMETRY.SPAN_SEARCH_DATA.APPLY}_`));
        expect(mockEndSpanWithAttributes).toHaveBeenCalledWith(applySpanId, {[CONST.TELEMETRY.ATTRIBUTE_REQUEST_ID]: MOCK_REQUEST_ID});

        // And an unmeasured command opens no phase spans at all
        jest.clearAllMocks();
        return Request.processWithMiddleware(request).then(() => {
            expect(mockStartSpan).not.toHaveBeenCalled();
        });
    });
});

test('Request.processWithMiddleware() keeps startup on the StartupData span names', () => {
    // Adding a measured command must not move OpenApp onto shared span names, or its history in Sentry breaks
    return Request.processWithMiddleware({command: WRITE_COMMANDS.OPEN_APP, data: {authToken: 'testToken'}}).then(() => {
        const startedSpanIds = mockStartSpan.mock.calls.map(([spanId]) => spanId);
        const startupPhases = [
            CONST.TELEMETRY.SPAN_STARTUP_DATA.WAIT,
            CONST.TELEMETRY.SPAN_STARTUP_DATA.DOWNLOAD,
            CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY,
            CONST.TELEMETRY.SPAN_STARTUP_DATA.RENDER,
        ];
        expect(startupPhases.filter((phase) => startedSpanIds.some((spanId) => spanId.startsWith(`${phase}_`)))).toEqual(startupPhases);
        expect(startedSpanIds.some((spanId) => spanId.startsWith('SearchData.'))).toBe(false);
    });
});
