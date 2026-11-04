import requestReview from '@libs/actions/StoreReview/index.native';
import Log from '@libs/Log';

import {hasAction, isAvailableAsync, requestReview as requestNativeReview} from 'expo-store-review';

jest.mock('expo-store-review', () => ({
    hasAction: jest.fn(),
    isAvailableAsync: jest.fn(),
    requestReview: jest.fn(),
}));
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), hmmm: jest.fn()},
}));

const mockedHasAction = jest.mocked(hasAction);
const mockedAvailability = jest.mocked(isAvailableAsync);
const mockedRequest = jest.mocked(requestNativeReview);
const mockedLog = jest.mocked(Log);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('native StoreReview', () => {
    it('stops when the awaited action check is false', async () => {
        // Given no review action.
        // When the native action requests a review.
        // Then availability and request are skipped.
        mockedHasAction.mockResolvedValue(false);
        await requestReview();
        expect(mockedAvailability).not.toHaveBeenCalled();
        expect(mockedLog.info.mock.calls).toContainEqual(['[StoreReview] No review action found', false, {hasAction: false}]);
    });

    it('stops when the platform is unavailable', async () => {
        // Given an action but no available review.
        // When the native action requests a review.
        // Then native review is skipped.
        mockedHasAction.mockResolvedValue(true);
        mockedAvailability.mockResolvedValue(false);
        await requestReview();
        expect(mockedRequest).not.toHaveBeenCalled();
        expect(mockedLog.info.mock.calls).toContainEqual(['[StoreReview] Review not available']);
    });

    it('awaits a successful native request', async () => {
        // Given an available review.
        // When the native action requests a review.
        // Then the native wrapper runs and completes.
        mockedHasAction.mockResolvedValue(true);
        mockedAvailability.mockResolvedValue(true);
        mockedRequest.mockResolvedValue();
        await requestReview();
        expect(mockedLog.info.mock.calls).toContainEqual(['[StoreReview] Requesting review', false, {available: true}]);
        expect(mockedRequest).toHaveBeenCalledTimes(1);
    });

    it('logs rejected native requests', async () => {
        // Given a rejected native wrapper.
        // When the native action requests a review.
        // Then the failure is logged and swallowed.
        const error = new Error('unavailable');
        mockedHasAction.mockResolvedValue(true);
        mockedAvailability.mockResolvedValue(true);
        mockedRequest.mockRejectedValue(error);
        await requestReview();
        expect(mockedLog.hmmm.mock.calls).toContainEqual(['[StoreReview] Error requesting review', {error}]);
    });

    it('logs the missing action callable and skips availability', async () => {
        // Given an Expo wrapper without hasAction.
        // When the real native action requests a review.
        // Then it logs the false action check and skips downstream calls.
        const availability = jest.fn();
        const nativeRequest = jest.fn();
        jest.resetModules();
        jest.doMock('expo-store-review', () => ({
            isAvailableAsync: availability,
            requestReview: nativeRequest,
        }));
        let invocation = Promise.resolve();
        let isolatedLog = Log;
        jest.isolateModules(() => {
            isolatedLog = require<{default: typeof Log}>('@libs/Log').default;
            invocation = require<{
                default: typeof requestReview;
            }>('@libs/actions/StoreReview/index.native').default();
        });
        await invocation;
        expect(jest.mocked(isolatedLog).info.mock.calls).toContainEqual(['[StoreReview] No review action found', false, {hasAction: false}]);
        expect(availability).not.toHaveBeenCalled();
        expect(nativeRequest).not.toHaveBeenCalled();
    });

    it('logs an unavailable review when its availability callable is missing', async () => {
        // Given an Expo wrapper without isAvailableAsync.
        // When the real native action requests a review.
        // Then it logs unavailability and skips the request.
        const nativeRequest = jest.fn();
        jest.resetModules();
        jest.doMock('expo-store-review', () => ({
            hasAction: jest.fn().mockResolvedValue(true),
            requestReview: nativeRequest,
        }));
        let invocation = Promise.resolve();
        let isolatedLog = Log;
        jest.isolateModules(() => {
            isolatedLog = require<{default: typeof Log}>('@libs/Log').default;
            invocation = require<{
                default: typeof requestReview;
            }>('@libs/actions/StoreReview/index.native').default();
        });
        await invocation;
        expect(jest.mocked(isolatedLog).info.mock.calls).toContainEqual(['[StoreReview] Review not available']);
        expect(nativeRequest).not.toHaveBeenCalled();
    });

    it('logs the missing request callable after availability succeeds', async () => {
        // Given an Expo wrapper without requestReview after successful checks.
        // When the real native action requests a review.
        // Then it logs the missing callable after both checks.
        const action = jest.fn().mockResolvedValue(true);
        const availability = jest.fn().mockResolvedValue(true);
        jest.resetModules();
        jest.doMock('expo-store-review', () => ({
            hasAction: action,
            isAvailableAsync: availability,
        }));
        let invocation = Promise.resolve();
        let isolatedLog = Log;
        jest.isolateModules(() => {
            isolatedLog = require<{default: typeof Log}>('@libs/Log').default;
            invocation = require<{
                default: typeof requestReview;
            }>('@libs/actions/StoreReview/index.native').default();
        });
        await invocation;
        expect(action).toHaveBeenCalledTimes(1);
        expect(availability).toHaveBeenCalledTimes(1);
        expect(jest.mocked(isolatedLog).info.mock.calls).toContainEqual(['[StoreReview] Requesting review', false, {available: true}]);
        expect(jest.mocked(isolatedLog).hmmm.mock.calls).toContainEqual(['[StoreReview] No requestNativeReview function found']);
    });
});
