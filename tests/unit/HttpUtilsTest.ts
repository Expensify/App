import {WRITE_COMMANDS} from '@libs/API/types';
import {setAuthToken} from '@libs/Network/NetworkStore';

import CONFIG from '@src/CONFIG';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import HttpUtils from '../../src/libs/HttpUtils';

const mockAlertUser = jest.fn<void, []>();
const mockPreparePrefetchRequest = jest.fn(() => ({prefetchKey: undefined as string | undefined, prefetchHeaders: undefined as Record<string, string> | undefined}));

jest.mock('@libs/actions/UpdateRequired', () => ({
    alertUser: () => mockAlertUser(),
}));
jest.mock('@libs/Prefetch/preparePrefetchRequest', () => ({
    __esModule: true,
    default: () => mockPreparePrefetchRequest(),
}));

type FetchArguments = [input: Parameters<typeof fetch>[0] | URL, init?: Parameters<typeof fetch>[1]];

const RECONNECT_APP_PREFETCH_KEY = `${WRITE_COMMANDS.RECONNECT_APP}:1`;

function mockUpdateRequiredResponse(isPrefetched: boolean) {
    return {
        ok: true,
        status: 200,
        headers: {get: (name: string) => (name === 'nitroPrefetched' && isPrefetched ? 'true' : null)},
        json: () => Promise.resolve({jsonCode: CONST.JSON_CODE.UPDATE_REQUIRED}),
    };
}

function mockFetchResponse(message: string, jsonCode: number = CONST.JSON_CODE.EXP_ERROR) {
    globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {get: () => null},
        json: () => Promise.resolve({jsonCode, message}),
    });
}

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
    });
});

afterEach(() => {
    jest.restoreAllMocks();
    mockAlertUser.mockClear();
    mockPreparePrefetchRequest.mockClear();
});

describe('HttpUtils', () => {
    // The mapping is keyed on the server message alone, not the command. The messages are
    // pinned as literals so a change to the CONST values can't silently drift from what the
    // server really sends.
    it.each([
        ['Transaction already created.', WRITE_COMMANDS.REQUEST_MONEY],
        ['The request has already been paid', WRITE_COMMANDS.PAY_MONEY_REQUEST],
        // The API layer can re-wrap Auth's 400 as a 666.
        ['400 Unique Constraints Violation', WRITE_COMMANDS.CREATE_DISTANCE_REQUEST],
    ])('maps the jsonCode-666 rejection "%s" to ALREADY_CREATED', async (message, command) => {
        mockFetchResponse(message);

        await expect(HttpUtils.xhr(command, {})).rejects.toMatchObject({
            message: CONST.ERROR.ALREADY_CREATED,
            title: message,
        });
    });

    it('leaves a jsonCode-666 response with an unrecognized message untouched', async () => {
        mockFetchResponse('Some other error');

        await expect(HttpUtils.xhr(WRITE_COMMANDS.PAY_MONEY_REQUEST, {})).resolves.toMatchObject({jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'Some other error'});
    });

    it('rejects a jsonCode-503 response so the queue rolls back and retries it', async () => {
        mockFetchResponse('This action is unavailable right now. Please try again shortly.', CONST.JSON_CODE.SERVICE_UNAVAILABLE);

        await expect(HttpUtils.xhr(WRITE_COMMANDS.ADD_COMMENT, {})).rejects.toMatchObject({
            message: CONST.ERROR.SERVICE_UNAVAILABLE,
            status: '503',
        });
    });

    it('still maps the duplicate-record message to DUPLICATE_RECORD when it arrives as a 400', async () => {
        mockFetchResponse('400 Unique Constraints Violation', CONST.JSON_CODE.BAD_REQUEST);

        await expect(HttpUtils.xhr(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, {})).rejects.toMatchObject({
            message: CONST.ERROR.DUPLICATE_RECORD,
            title: CONST.ERROR_TITLE.DUPLICATE_RECORD,
        });
    });

    it('retries a prefetched 426 without the prefetchKey instead of showing Update Required', async () => {
        // Given a startup prefetch that was sent with a body saved by the previous build, so the server answered 426,
        // and a fresh request that the server accepts
        mockPreparePrefetchRequest.mockReturnValueOnce({prefetchKey: RECONNECT_APP_PREFETCH_KEY, prefetchHeaders: {prefetchKey: RECONNECT_APP_PREFETCH_KEY}});
        const responses = [mockUpdateRequiredResponse(true), {ok: true, status: 200, headers: {get: () => null}, json: () => Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS})}];
        const requestHeaders: Array<HeadersInit | undefined> = [];
        globalThis.fetch = jest.fn().mockImplementation((_url: string, init: RequestInit) => {
            requestHeaders.push(init.headers);
            return Promise.resolve(responses.shift());
        });

        // When the new build sends ReconnectApp and gets the prefetched 426
        const response = await HttpUtils.xhr(WRITE_COMMANDS.RECONNECT_APP, {});

        // Then the request is sent again without the prefetchKey, so nitro-fetch can't serve the stale cached 426,
        // and the app isn't blocked because the server accepted the current build
        expect(requestHeaders).toEqual([{prefetchKey: RECONNECT_APP_PREFETCH_KEY}, undefined]);
        expect(mockAlertUser).not.toHaveBeenCalled();
        expect(response).toMatchObject({jsonCode: CONST.JSON_CODE.SUCCESS});
    });

    it('shows Update Required when the retry of a prefetched 426 also gets a 426', async () => {
        // Given the installed build itself is below the server's minimum version, so both the prefetch and the retry get a 426
        mockPreparePrefetchRequest.mockReturnValueOnce({prefetchKey: RECONNECT_APP_PREFETCH_KEY, prefetchHeaders: {prefetchKey: RECONNECT_APP_PREFETCH_KEY}});
        const fetchMock = jest.fn().mockResolvedValueOnce(mockUpdateRequiredResponse(true)).mockResolvedValueOnce(mockUpdateRequiredResponse(false));
        globalThis.fetch = fetchMock;

        // When ReconnectApp is sent
        await HttpUtils.xhr(WRITE_COMMANDS.RECONNECT_APP, {});

        // Then it is retried only once, because the second 426 came from the server, and the user is asked to update
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(mockAlertUser).toHaveBeenCalledTimes(1);
    });

    describe('attachment HEAD requests', () => {
        const imageURL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/image.jpg`;

        beforeEach(() => {
            setAuthToken('api-token', 'image-token');
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        it('returns the HTTP status without reading a response body', async () => {
            // Given a rejected image response without a body that must not enter JSON API parsing
            const json = jest.fn();
            const fetchMock = jest.fn().mockResolvedValue({status: CONST.HTTP_STATUS.UNAUTHORIZED, json});
            globalThis.fetch = fetchMock;

            // When the existing transport sends an authenticated HEAD to the image endpoint
            const result = await HttpUtils.head(imageURL);

            // Then the caller receives the rejection without JSON parsing or a request body
            expect(result).toBe(CONST.HTTP_STATUS.UNAUTHORIZED);
            expect(json).not.toHaveBeenCalled();
            expect(fetchMock).toHaveBeenCalledWith(
                imageURL,
                expect.objectContaining({method: CONST.NETWORK.METHOD.HEAD, body: null, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: 'image-token'}, credentials: 'omit'}),
            );
        });

        it.each(['untrusted host', 'missing token'])('prevents credential leakage with an %s', async (reason) => {
            // Given either an untrusted host or a session transition missing its matching encrypted token
            if (reason === 'missing token') {
                setAuthToken('different-api-token');
            }
            const fetchMock = jest.fn();
            globalThis.fetch = fetchMock;
            const url = reason === 'untrusted host' ? 'https://attacker.example/image.jpg' : imageURL;

            // When authenticated recovery reaches the transport
            const result = await HttpUtils.head(url);

            // Then the transport independently prevents an unsafe request
            expect(result).toBe(CONST.HTTP_STATUS.FORBIDDEN);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it.each(['timeout', 'cancellation'])('aborts a pending HEAD on %s and releases its timer', async (reason) => {
            // Given a HEAD request that cannot complete on its own
            jest.useFakeTimers();
            const controller = new AbortController();
            globalThis.fetch = jest.fn<ReturnType<typeof fetch>, FetchArguments>().mockImplementation(
                (input, options) =>
                    new Promise((resolve, reject) => {
                        options?.signal?.addEventListener('abort', () => reject(new Error('Probe aborted')));
                    }),
            );
            const probe = HttpUtils.head(imageURL, controller.signal);
            const rejection = expect(probe).rejects.toMatchObject({name: CONST.ERROR.REQUEST_CANCELLED});

            // When the deadline passes or the image is replaced
            if (reason === 'timeout') {
                await jest.advanceTimersByTimeAsync(CONST.TIMING.IMAGE_LOAD_STALL_TIMEOUT);
            } else {
                controller.abort();
            }
            await rejection;

            // Then cancellation is classified without leaving a pending timeout
            expect(jest.getTimerCount()).toBe(0);
        });
    });
});
