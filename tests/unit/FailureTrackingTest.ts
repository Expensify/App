import CONST from '@src/CONST';
import {getFailureCount, recordFailure, reset} from '@src/libs/FailureTracker';
import FailureTracking from '@src/libs/Middleware/FailureTracking';

import type {OnyxKey} from 'react-native-onyx';

import type Request from '../../src/types/onyx/Request';

jest.mock('@src/libs/Log');

const request: Request<OnyxKey> = {command: 'FailureTrackingTest'};

describe('FailureTracking middleware', () => {
    beforeEach(() => {
        reset();
        jest.restoreAllMocks();
    });

    test('calls recordSuccess on resolved response', async () => {
        const responseData = {jsonCode: 200};
        const result = await FailureTracking(Promise.resolve(responseData), request, false);

        expect(result).toBe(responseData);
    });

    test('calls recordFailure on FAILED_TO_FETCH error', async () => {
        const error = new Error(CONST.ERROR.FAILED_TO_FETCH);

        await expect(FailureTracking(Promise.reject(error), request, false)).rejects.toThrow(CONST.ERROR.FAILED_TO_FETCH);

        expect(getFailureCount()).toBe(1);
    });

    test('calls recordFailure on EXPENSIFY_SERVICE_INTERRUPTED error', async () => {
        const error = new Error(CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED);

        await expect(FailureTracking(Promise.reject(error), request, false)).rejects.toThrow(CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED);

        expect(getFailureCount()).toBe(1);
    });

    test('does NOT call recordFailure on other errors', async () => {
        const error = new Error('some random error');

        await expect(FailureTracking(Promise.reject(error), request, false)).rejects.toThrow('some random error');

        expect(getFailureCount()).toBe(0);
    });

    test('resolved response resets failure count', async () => {
        recordFailure();
        expect(getFailureCount()).toBe(1);

        // A resolved response should reset via recordSuccess
        await FailureTracking(Promise.resolve({jsonCode: 200}), request, false);
        expect(getFailureCount()).toBe(0);
    });

    test('always re-throws errors', async () => {
        const connectivityError = new Error(CONST.ERROR.FAILED_TO_FETCH);
        await expect(FailureTracking(Promise.reject(connectivityError), request, false)).rejects.toThrow(connectivityError);

        const otherError = new Error('timeout');
        await expect(FailureTracking(Promise.reject(otherError), request, false)).rejects.toThrow(otherError);
    });
});
