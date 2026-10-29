import type {ApiRequestCommandParameters} from '@libs/API/types';

import HttpUtils from '@src/libs/HttpUtils';
import LoadTest from '@src/libs/Middleware/LoadTest';
import {setLoadTestParameters} from '@src/libs/Network/LoadTestState';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

const FUTURE = '2099-01-01T00:00:00';
const PAST = '2000-01-01T00:00:00';

const TEST_COMMAND = 'OpenReport';
const TEST_URL = 'https://www.expensify.com.dev/api/OpenReport?';

Onyx.init({
    keys: ONYXKEYS,
});

const fetchMock = TestHelper.setupGlobalFetchMock();

beforeEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
    SequentialQueue.resetQueue();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    NetworkStore.checkRequiredData();
    await waitForNetworkPromises();
    jest.clearAllMocks();
    Request.clearMiddlewares();
    setLoadTestParameters(null);
});

function getMockCallsForTestUrl() {
    const calls = fetchMock.mock.calls;
    return calls.filter((call) => call[0] === TEST_URL);
}

function getFormBodyAt(index: number): FormData {
    const calls = getMockCallsForTestUrl();
    const call = calls.at(index);
    if (!call) {
        throw new Error(`Expected a fetch call at index ${index}, but only ${calls.length} call(s) were made`);
    }
    const body = call[1]?.body;
    if (!(body instanceof FormData)) {
        throw new Error(`Expected a FormData body at fetch call ${index}`);
    }
    return body;
}

describe('LoadTest middleware', () => {
    it('does not fire any duplicate requests when load testing is inactive', async () => {
        // Given the LoadTest middleware is registered and no X-Load-Test parameters are set
        Request.addMiddleware(LoadTest);

        // When we process a single request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}});
        await waitForNetworkPromises();

        // Then only the real request should fire and no duplicates should be triggered
        expect(getMockCallsForTestUrl()).toHaveLength(1);
    });

    it('fires multiplier - 1 duplicate requests with mockRequest=true form param when active', async () => {
        // Given the LoadTest middleware is registered and load testing is active with multiplier 3
        Request.addMiddleware(LoadTest);
        setLoadTestParameters(JSON.stringify({multiplier: 3, expire: FUTURE}));

        // When we process a single request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}});
        await waitForNetworkPromises();

        // Then we should see 1 real request + 2 duplicates (multiplier - 1)
        expect(getMockCallsForTestUrl()).toHaveLength(3);

        // And the real request should NOT carry mockRequest in its form body
        const realBody = getFormBodyAt(0);
        expect(realBody.has('mockRequest')).toBe(false);

        // And every duplicate should carry mockRequest=true so the server treats them as load-test traffic
        // (sent as a form param rather than a header to avoid CORS preflight requests for cross-origin traffic)
        const firstDuplicateBody = getFormBodyAt(1);
        const secondDuplicateBody = getFormBodyAt(2);
        expect(firstDuplicateBody.get('mockRequest')).toBe('true');
        expect(secondDuplicateBody.get('mockRequest')).toBe('true');
    });

    it('does not duplicate when the load-test window has expired', async () => {
        // Given the LoadTest middleware is registered and the load-test expire timestamp has already passed
        Request.addMiddleware(LoadTest);
        setLoadTestParameters(JSON.stringify({multiplier: 5, expire: PAST}));

        // When we process a single request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}});
        await waitForNetworkPromises();

        // Then only the real request should fire (the expire window guards against accidentally DDOSing ourselves)
        expect(getMockCallsForTestUrl()).toHaveLength(1);
    });

    it('still fires duplicates when the real request fails (matches .finally semantics)', async () => {
        // Given the LoadTest middleware is registered, load testing is active, and the real request will fail
        Request.addMiddleware(LoadTest);
        setLoadTestParameters(JSON.stringify({multiplier: 3, expire: FUTURE}));
        fetchMock.mockImplementationOnce(() => Promise.reject(new Error('network down')));

        // When we process a request whose fetch call rejects
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}}).catch(() => {
            // Swallow the rejection here so the test can continue.
        });
        await waitForNetworkPromises();

        // Then duplicates should still have been fired (mirrors Web-Expensify's deferred.always behavior)
        expect(getMockCallsForTestUrl()).toHaveLength(3);
        expect(getFormBodyAt(1).get('mockRequest')).toBe('true');
        expect(getFormBodyAt(2).get('mockRequest')).toBe('true');
    });

    it('duplicates do not themselves trigger another round of duplicates (no infinite loop)', async () => {
        // Given the LoadTest middleware is registered and load testing is active with multiplier 4
        Request.addMiddleware(LoadTest);
        setLoadTestParameters(JSON.stringify({multiplier: 4, expire: FUTURE}));

        // When we process a single request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}});
        await waitForNetworkPromises();

        // Then we expect exactly 1 real + 3 duplicates = 4 calls.
        // If duplicates went back through the middleware pipeline, we would observe 4 + 4*3 = 16 calls instead.
        expect(getMockCallsForTestUrl()).toHaveLength(4);
    });

    it('preserves the original request command and forwards the same parameters to duplicates', async () => {
        // Given the LoadTest middleware is registered and load testing is active with multiplier 2
        Request.addMiddleware(LoadTest);
        setLoadTestParameters(JSON.stringify({multiplier: 2, expire: FUTURE}));

        // When we process a request with a specific reportID
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '99'}});
        await waitForNetworkPromises();

        // Then the duplicate should hit the same URL and carry the same reportID as the real request
        expect(getMockCallsForTestUrl()).toHaveLength(2);
        const realBody = getFormBodyAt(0);
        const duplicateBody = getFormBodyAt(1);
        expect(realBody.get('reportID')).toBe('99');
        expect(duplicateBody.get('reportID')).toBe('99');
        // And the duplicate is the only one tagged with mockRequest=true
        expect(realBody.has('mockRequest')).toBe(false);
        expect(duplicateBody.get('mockRequest')).toBe('true');
    });

    it('reads the X-Load-Test response header and applies it to subsequent fan-out', async () => {
        // Given the LoadTest middleware is registered and load testing starts disabled
        Request.addMiddleware(LoadTest);

        // And the next response will carry an X-Load-Test header advertising multiplier 3
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve(
                createMock<Response>({
                    ok: true,
                    headers: new Headers([['X-Load-Test', JSON.stringify({multiplier: 3, expire: FUTURE})]]),
                    json: () => Promise.resolve({jsonCode: 200}),
                }),
            ),
        );

        // When we process the first request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}});
        await waitForNetworkPromises();

        // Then the first request itself makes 1 real + 2 duplicates because the header is parsed in
        // HttpUtils.processHTTPRequest before the LoadTest middleware's .finally runs (matches Web-Expensify's
        // setLoadTestParametersCallback running before duplicateMockPostRequest in api.js).
        expect(getMockCallsForTestUrl()).toHaveLength(3);

        // And when we process a second request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '2'}});
        await waitForNetworkPromises();

        // Then it should also make 3 calls (1 real + 2 duplicates) using the previously stored multiplier
        expect(getMockCallsForTestUrl()).toHaveLength(3 + 3);
    });

    it('clears the multiplier when a subsequent response omits the X-Load-Test header', async () => {
        // Given the LoadTest middleware is registered and load testing is active with multiplier 3
        Request.addMiddleware(LoadTest);
        setLoadTestParameters(JSON.stringify({multiplier: 3, expire: FUTURE}));

        // When we process a request whose mocked response carries no Headers object (state should remain intact)
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '1'}});
        await waitForNetworkPromises();

        // Then it should make 3 calls (1 real + 2 duplicates)
        expect(getMockCallsForTestUrl()).toHaveLength(3);

        // And given the next response explicitly returns Headers without an X-Load-Test entry
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve(
                createMock<Response>({
                    ok: true,
                    headers: new Headers({}),
                    json: () => Promise.resolve({jsonCode: 200}),
                }),
            ),
        );

        // When we process a second request
        await Request.processWithMiddleware({command: TEST_COMMAND, data: {authToken: 'testToken', reportID: '2'}});
        await waitForNetworkPromises();

        // Then load testing is disabled (state cleared) and only the real request is sent (3 + 1 total)
        expect(getMockCallsForTestUrl()).toHaveLength(4);
    });
});

// Jest's jsdom has no Request global. whatwg-fetch/fetch.js converts string inputs to a string url,
// but defaults mode and referrer to null. Keep only its source-backed url view here.
// createMock<Request> deliberately accepts this incomplete native fixture for identity and non-string handling.
const {Request: FetchRequest} = jest.requireActual<{Request: new (input: string) => Pick<globalThis.Request, 'url'>}>('whatwg-fetch');

describe.each([
    {name: 'createGlobalFetchMock', createFetchMock: TestHelper.createGlobalFetchMock},
    {name: 'getGlobalFetchMock', createFetchMock: TestHelper.getGlobalFetchMock},
])('$name fetch contract', ({createFetchMock}) => {
    it('captures native string, Request and URL inputs with optional request options', async () => {
        // Given the actual polyfill instance is an incomplete Request fixture and options stay native
        expect(typeof FetchRequest).toBe('function');
        const polyfillRequest = new FetchRequest(TEST_URL);
        const request = createMock<globalThis.Request>(polyfillRequest);
        const url = new URL(TEST_URL);
        const options: RequestInit = {method: 'POST', body: new FormData()};
        const mockFetch = createFetchMock();

        // When native inputs are passed with omitted, explicit undefined and present options
        const stringResponse: Promise<Response> = mockFetch(TEST_URL);
        const requestResponse: Promise<Response> = mockFetch(request, undefined);
        const urlResponse: Promise<Response> = mockFetch(url, options);
        await mockFetch(TEST_URL, options);
        await mockFetch(request, options);
        await mockFetch(url);

        // Then the original inputs and options remain in call order and responses retain the success JSON
        expect(request).toBe(polyfillRequest);
        expect(mockFetch.mock.calls).toEqual([[TEST_URL], [request, undefined], [url, options], [TEST_URL, options], [request, options], [url]]);
        expect(mockFetch.mock.calls.at(1)?.[0]).toBe(request);
        expect(mockFetch.mock.calls.at(2)?.[0]).toBe(url);
        expect(mockFetch.mock.calls.at(2)?.[1]).toBe(options);
        for (const response of await Promise.all([stringResponse, requestResponse, urlResponse])) {
            expect(response.ok).toBe(true);
            await expect(response.json()).resolves.toEqual({jsonCode: 200});
        }
    });

    it('matches API commands only for string inputs and extracts their FormData', async () => {
        // Given the existing command handler reads native OpenReport parameters
        const mockFetch = createFetchMock();
        const responseHandler = jest.fn((params: ApiRequestCommandParameters[typeof TEST_COMMAND]) => ({jsonCode: 201, message: params.reportID}));
        mockFetch.mockAPICommand(TEST_COMMAND, responseHandler);
        const body = new FormData();
        body.append('reportID', '99');
        const options: RequestInit = {method: 'POST', body};

        // When the same API URL is supplied as a string, Request and URL
        const stringResponse = await mockFetch(TEST_URL, options);
        const requestResponse = await mockFetch(createMock<globalThis.Request>(new FetchRequest(TEST_URL)), options);
        const urlResponse = await mockFetch(new URL(TEST_URL), options);

        // Then only the string uses the command handler and its JSON fields override the default success code
        await expect(stringResponse.json()).resolves.toEqual({jsonCode: 201, message: '99'});
        await expect(requestResponse.json()).resolves.toEqual({jsonCode: 200});
        await expect(urlResponse.json()).resolves.toEqual({jsonCode: 200});
        expect(responseHandler).toHaveBeenCalledTimes(1);
        expect(responseHandler).toHaveBeenCalledWith({reportID: '99'});
    });

    it('preserves response override precedence and fail then succeed controls', async () => {
        // Given response overrides replace success fields but failure has its own response
        const json = jest.fn(() => Promise.resolve({jsonCode: 202}));
        const mockFetch = createFetchMock({ok: false, json});

        // When the mock succeeds, fails and succeeds again
        const successResponse = await mockFetch(TEST_URL);
        mockFetch.fail();
        const failureResponse = await mockFetch(TEST_URL);
        mockFetch.succeed();
        const restoredResponse = await mockFetch(TEST_URL);

        // Then overrides win only on success and the failure JSON remains unchanged
        expect(successResponse.ok).toBe(false);
        await expect(successResponse.json()).resolves.toEqual({jsonCode: 202});
        expect(failureResponse.ok).toBe(true);
        await expect(failureResponse.json()).resolves.toEqual({jsonCode: 400});
        expect(restoredResponse.ok).toBe(false);
        await expect(restoredResponse.json()).resolves.toEqual({jsonCode: 202});
        expect(json).toHaveBeenCalledTimes(2);
    });

    it('creates independent mock identities and state', async () => {
        // Given each factory call starts with its own history and failure state
        const firstMock = createFetchMock();
        const secondMock = createFetchMock();
        firstMock.fail();

        // When both mocks handle the same input
        const firstResponse = await firstMock(TEST_URL);
        const secondResponse = await secondMock(TEST_URL);
        firstMock.mockClear();

        // Then controls and clearing one mock cannot alter the other
        expect(firstMock).not.toBe(secondMock);
        await expect(firstResponse.json()).resolves.toEqual({jsonCode: 400});
        await expect(secondResponse.json()).resolves.toEqual({jsonCode: 200});
        expect(firstMock.mock.calls).toHaveLength(0);
        expect(secondMock.mock.calls).toEqual([[TEST_URL]]);
    });

    it('resumes paused inputs in order while retaining the existing omission of queued options', async () => {
        // Given command responses need FormData and pause delays every native input
        const mockFetch = createFetchMock();
        const responseHandler = jest.fn((params: ApiRequestCommandParameters[typeof TEST_COMMAND]) => ({message: params.reportID ?? 'missing'}));
        mockFetch.mockAPICommand(TEST_COMMAND, responseHandler);
        const body = new FormData();
        body.append('reportID', '99');
        const options: RequestInit = {method: 'POST', body};
        const request = createMock<globalThis.Request>(new FetchRequest(TEST_URL));
        const url = new URL(TEST_URL);
        const resolvedInputs: Array<Parameters<typeof mockFetch>[0]> = [];
        mockFetch.pause();

        // When the inputs queue and the real batched-update helper runs before and during resume
        const stringResponse = mockFetch(TEST_URL, options).then((response) => {
            resolvedInputs.push(TEST_URL);
            return response;
        });
        const requestResponse = mockFetch(request, options).then((response) => {
            resolvedInputs.push(request);
            return response;
        });
        const urlResponse = mockFetch(url, options).then((response) => {
            resolvedInputs.push(url);
            return response;
        });
        await waitForBatchedUpdates();
        expect(resolvedInputs).toEqual([]);
        await mockFetch.resume();

        // Then resolution keeps queue order and string matching receives no queued FormData
        expect(resolvedInputs).toEqual([TEST_URL, request, url]);
        expect(mockFetch.mock.calls).toEqual([
            [TEST_URL, options],
            [request, options],
            [url, options],
        ]);
        await expect((await stringResponse).json()).resolves.toEqual({jsonCode: 200, message: 'missing'});
        await expect((await requestResponse).json()).resolves.toEqual({jsonCode: 200});
        await expect((await urlResponse).json()).resolves.toEqual({jsonCode: 200});
        expect(responseHandler).toHaveBeenCalledWith({});

        // When a new call follows resume it receives its present options normally
        await expect((await mockFetch(TEST_URL, options)).json()).resolves.toEqual({jsonCode: 200, message: '99'});
        expect(responseHandler).toHaveBeenLastCalledWith({reportID: '99'});
    });

    it('retains the existing queue when resume is called again', async () => {
        // Given a response getter that observes each response built from the existing queue
        let responseCount = 0;
        const mockFetch = createFetchMock({
            get ok() {
                responseCount += 1;
                return true;
            },
        });
        mockFetch.pause();
        const response = mockFetch(TEST_URL);

        // When resume runs twice without resetting the queue
        await mockFetch.resume();
        expect(responseCount).toBe(1);
        await mockFetch.resume();

        // Then the retained queue rebuilds a response without adding a fetch call or resolving twice
        expect(responseCount).toBe(2);
        expect((await response).ok).toBe(true);
        expect(mockFetch.mock.calls).toEqual([[TEST_URL]]);
    });

    it('resets calls, implementation, queued requests, handlers and state flags', async () => {
        // Given failure and pause are active and a registered command has a queued request
        const mockFetch = createFetchMock();
        const originalImplementation = mockFetch.getMockImplementation();
        expect(originalImplementation).toBeDefined();
        const responseHandler = jest.fn(() => ({message: 'registered'}));
        mockFetch.mockAPICommand(TEST_COMMAND, responseHandler);
        mockFetch.fail();
        mockFetch.pause();
        let queuedRequestResolved = false;
        const queuedRequest = mockFetch(TEST_URL).then(() => {
            queuedRequestResolved = true;
        });
        expect(queuedRequest).toBeInstanceOf(Promise);

        // When reset clears the implementation as Jest specifies
        expect(mockFetch.mockReset()).toBe(mockFetch);
        expect(mockFetch.mock.calls).toEqual([]);
        expect(mockFetch.getMockImplementation()).toBeUndefined();

        // Then restoring the actual original implementation exposes cleared flags, queue and handlers
        if (!originalImplementation) {
            throw new Error('Expected the original fetch mock implementation');
        }
        mockFetch.mockImplementation(originalImplementation);
        const response = await mockFetch(TEST_URL);
        await expect(response.json()).resolves.toEqual({jsonCode: 200});
        await mockFetch.resume();
        expect(queuedRequestResolved).toBe(false);
        expect(responseHandler).not.toHaveBeenCalled();
        expect(mockFetch.mock.calls).toEqual([[TEST_URL]]);
    });
});
