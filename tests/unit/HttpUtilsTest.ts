import {WRITE_COMMANDS} from '@libs/API/types';
import {getFailureCount, onSustainedFailureChange, reset as resetFailureTracker} from '@libs/FailureTracker';
import Log from '@libs/Log';
import FailureTracking from '@libs/Middleware/FailureTracking';
import Logging from '@libs/Middleware/Logging';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Request from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import HttpUtils from '../../src/libs/HttpUtils';

const request: Request<OnyxKey> = {command: WRITE_COMMANDS.REQUEST_MONEY};

function mockFetchResponse(message: string) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {get: () => null},
        json: () => Promise.resolve({jsonCode: CONST.JSON_CODE.EXP_ERROR, message}),
    });
}

function mockFetchError(error: Error) {
    global.fetch = jest.fn().mockRejectedValue(error);
}

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
    });
});

afterEach(() => {
    resetFailureTracker();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

describe('HttpUtils', () => {
    it.each(['Unknown St13runtime_error error.', 'Unknown std::runtime_error error.', 'Unknown std::__1::runtime_error error.'])(
        'normalizes the opaque NitroFetch rejection "%s"',
        async (message) => {
            mockFetchError(new Error(message));

            await expect(HttpUtils.xhr(WRITE_COMMANDS.REQUEST_MONEY, {})).rejects.toMatchObject({
                message: CONST.ERROR.NATIVE_FETCH_FAILED,
                title: message,
            });
        },
    );

    it('leaves aborted requests untouched', async () => {
        const error = new DOMException('Aborted', CONST.ERROR.REQUEST_CANCELLED);
        mockFetchError(error);

        await expect(HttpUtils.xhr(WRITE_COMMANDS.REQUEST_MONEY, {})).rejects.toBe(error);
    });

    it('leaves recognized network errors untouched', async () => {
        const error = new Error(CONST.ERROR.FAILED_TO_FETCH);
        mockFetchError(error);

        await expect(HttpUtils.xhr(WRITE_COMMANDS.REQUEST_MONEY, {})).rejects.toBe(error);
    });

    it('classifies a normalized NitroFetch rejection as a connectivity failure without alerting', async () => {
        mockFetchError(new Error('Unknown St13runtime_error error.'));
        const alertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => undefined);

        const result = FailureTracking(Logging(HttpUtils.xhr(WRITE_COMMANDS.REQUEST_MONEY, {}), request, false), request, false);

        await expect(result).rejects.toThrow(CONST.ERROR.NATIVE_FETCH_FAILED);
        expect(getFailureCount()).toBe(1);
        expect(alertSpy).not.toHaveBeenCalled();
    });

    it('reports sustained normalized NitroFetch failures', async () => {
        jest.useFakeTimers();
        const onSustainedFailure = jest.fn();
        const unsubscribe = onSustainedFailureChange(onSustainedFailure);

        for (let index = 0; index < CONST.NETWORK.SUSTAINED_FAILURE_THRESHOLD_COUNT - 1; index++) {
            mockFetchError(new Error('Unknown St13runtime_error error.'));
            await expect(FailureTracking(HttpUtils.xhr(WRITE_COMMANDS.REQUEST_MONEY, {}), request, false)).rejects.toThrow(CONST.ERROR.NATIVE_FETCH_FAILED);
        }

        jest.advanceTimersByTime(CONST.NETWORK.SUSTAINED_FAILURE_WINDOW_MS + 1);
        mockFetchError(new Error('Unknown St13runtime_error error.'));
        await expect(FailureTracking(HttpUtils.xhr(WRITE_COMMANDS.REQUEST_MONEY, {}), request, false)).rejects.toThrow(CONST.ERROR.NATIVE_FETCH_FAILED);

        expect(onSustainedFailure).toHaveBeenCalledWith(true);
        unsubscribe();
    });

    // The mapping is keyed on the server message alone, not the command. The messages are
    // pinned as literals so a change to the CONST values can't silently drift from what the
    // server really sends.
    it.each([
        ['Transaction already created.', WRITE_COMMANDS.REQUEST_MONEY],
        ['The request has already been paid', WRITE_COMMANDS.PAY_MONEY_REQUEST],
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
});
