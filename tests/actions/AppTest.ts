import {waitFor} from '@testing-library/react-native';

import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {waitForIdle} from '@libs/Network/SequentialQueue';

import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import '@libs/Navigation/AppNavigator/AuthScreens';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type Request from '../../src/types/onyx/Request';
import type {MockFetch} from '../utils/TestHelper';

import * as App from '../../src/libs/actions/App';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');

OnyxUpdateManager();

describe('actions/App', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        mockFetch = TestHelper.createGlobalFetchMock();
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('lastFullReconnectTime - openApp', async () => {
        // When Open App runs
        App.openApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - full reconnectApp', async () => {
        // When a full ReconnectApp runs
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        App.reconnectApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - incremental reconnectApp', async () => {
        // When an incremental ReconnectApp runs
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        App.reconnectApp(123);
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should NOT be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeUndefined();
    });

    test('reconnectAppWithSideEffects falls back to openApp when the app has not finished loading', async () => {
        // Given OpenApp hasn't finished yet, so there's no base app state
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, false);

        // When the pause watchdog escalates with an incremental reconnect
        await App.reconnectAppWithSideEffects(123);
        await waitForBatchedUpdates();

        // Then it must fall back to a full OpenApp instead of sending a nonsensical incremental reconnect
        const calledCommands = mockFetch.mock.calls.map(([input]) => (typeof input === 'string' ? input.match(/api\/(\w+)\?/)?.[1] : undefined));
        expect(calledCommands).toContain('OpenApp');
        expect(calledCommands).not.toContain('ReconnectApp');
    });

    test('reconnectAppWithSideEffects is a no-op when using imported state', async () => {
        // Given the app has loaded from imported state
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.set(ONYXKEYS.IS_USING_IMPORTED_STATE, true);

        // When the pause watchdog escalates with an incremental reconnect
        await App.reconnectAppWithSideEffects(123);
        await waitForBatchedUpdates();

        // Then no API call should be made, since imported state never makes API calls
        expect(mockFetch).not.toHaveBeenCalled();
    });

    test('reconnectAppWithSideEffects reopens product marketing readiness only after a full reconnect', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE]: {resetID: 'side-effect-reset', readyIDs: {}},
        });
        await waitForBatchedUpdates();

        await App.reconnectAppWithSideEffects(123);
        await waitForBatchedUpdates();
        let dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).not.toBe(true);

        await App.reconnectAppWithSideEffects();
        await waitForBatchedUpdates();
        dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).toBe(true);
    });

    test('a full side-effect reconnect cannot mark a newer account-reset generation ready', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE]: {resetID: 'old-side-effect-reset', readyIDs: {'old-side-effect-reset': true}},
        });
        await waitForBatchedUpdates();
        mockFetch.pause();

        const reconnectPromise = App.reconnectAppWithSideEffects();
        await waitForBatchedUpdates();
        // Simulate the replacement generation finishing before this older side-effect response.
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'new-side-effect-reset', readyIDs: {'new-side-effect-reset': true}});
        await waitForBatchedUpdates();

        await mockFetch.resume();
        await reconnectPromise;
        await waitForBatchedUpdates();

        const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.resetID).toBe('new-side-effect-reset');
        expect(dataState?.readyIDs?.['new-side-effect-reset']).toBe(true);
    });

    test('a stale full side-effect reconnect leaves a newer generation pending until its own full reconnect succeeds', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE]: {resetID: 'old-pending-reset', readyIDs: {'old-pending-reset': true}},
        });
        await waitForBatchedUpdates();
        mockFetch.pause();

        const staleReconnectPromise = App.reconnectAppWithSideEffects();
        await waitForBatchedUpdates();
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'new-pending-reset', readyIDs: {}});
        await waitForBatchedUpdates();

        await mockFetch.resume();
        await staleReconnectPromise;
        await waitForBatchedUpdates();

        let dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.['new-pending-reset']).not.toBe(true);

        await App.reconnectAppWithSideEffects();
        await waitForBatchedUpdates();
        dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.['new-pending-reset']).toBe(true);
    });

    test('a failed full side-effect reconnect leaves the current product marketing generation pending', async () => {
        const failedFetch = TestHelper.createGlobalFetchMock();
        failedFetch.fail();
        global.fetch = failedFetch;
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE]: {resetID: 'failed-side-effect-reset', readyIDs: {}},
        });
        await waitForBatchedUpdates();

        await App.reconnectAppWithSideEffects();
        await waitForBatchedUpdates();

        const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.['failed-side-effect-reset']).not.toBe(true);
    });

    test('openApp immediately marks product marketing data ready when using imported state', async () => {
        await Onyx.set(ONYXKEYS.IS_USING_IMPORTED_STATE, true);
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'imported-reset', readyIDs: {}});
        await waitForBatchedUpdates();

        await App.openApp();
        await waitForBatchedUpdates();

        expect(mockFetch).not.toHaveBeenCalled();
        const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).toBe(true);
    });

    test('trigger full reconnect', async () => {
        const triggerFullReconnect = jest.spyOn(App, 'triggerFullReconnect');

        // When OpenApp runs
        App.openApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();

        // And when a new server cutoff is received
        const serverReconnectCutoff = DateUtils.getDBTime();
        Onyx.set(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, serverReconnectCutoff);
        await waitForBatchedUpdates();

        // Then a full reconnect should be triggered for the received server cutoff
        expect(triggerFullReconnect).toHaveBeenCalledTimes(1);
        expect(triggerFullReconnect).toHaveBeenCalledWith(serverReconnectCutoff);
    });

    test("don't trigger full reconnect", async () => {
        const triggerFullReconnect = jest.spyOn(App, 'triggerFullReconnect');

        // When OpenApp runs
        App.openApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();

        // And when a server cutoff is received with a timestamp in the past
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        Onyx.set(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, DateUtils.getDBTime(yesterday.toISOString()));
        await waitForBatchedUpdates();

        // Then a full reconnect should NOT be triggered
        expect(triggerFullReconnect).toHaveBeenCalledTimes(0);
    });

    test('clearOnyxAndResetApp preserves rolled-back ongoing requests across reset', async () => {
        const persistedRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'AddComment',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
            requestIndex: 123,
        };

        jest.spyOn(Navigation, 'clearPreloadedRoutes').mockImplementation(() => {});
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await PersistedRequests.save(persistedRequest);
        await waitForBatchedUpdates();

        PersistedRequests.processNextRequest();
        await waitForBatchedUpdates();

        expect(PersistedRequests.getOngoingRequest()).toEqual(persistedRequest);

        await App.clearOnyxAndResetApp();
        await waitForBatchedUpdates();

        await waitFor(async () => {
            const diskQueue = (await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS)) ?? [];
            expect(diskQueue).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        command: 'AddComment',
                        requestIndex: 123,
                        isRollback: true,
                    }),
                ]),
            );
            expect((await getOnyxValue(ONYXKEYS.PERSISTED_ONGOING_REQUESTS)) == null).toBe(true);
        });
    });

    test('clearOnyxAndResetApp keeps product marketing gated while account data is rehydrating', async () => {
        jest.spyOn(Navigation, 'clearPreloadedRoutes').mockImplementation(() => {});
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'loaded-reset', readyIDs: {'loaded-reset': true}});
        mockFetch.pause();

        try {
            await App.clearOnyxAndResetApp();
            await waitForBatchedUpdates();

            const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
            expect(dataState?.resetID).not.toBe('loaded-reset');
            expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).not.toBe(true);
        } finally {
            await mockFetch.resume();
        }

        await waitForIdle();
        await waitFor(async () => {
            const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
            expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).toBe(true);
        });
    });

    describe('getNonOptimisticPolicyIDs', () => {
        it('should return empty array when policies is empty object', () => {
            const result = App.getNonOptimisticPolicyIDs({});
            expect(result).toEqual([]);
        });

        it('should filter out undefined policies', () => {
            const policies = {
                policy1: {id: 'policy1', name: 'Policy 1'},
                policy2: undefined,
                policy3: {id: 'policy3', name: 'Policy 3'},
            } as unknown as OnyxCollection<Policy>;
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy1', 'policy3']);
        });

        it('should filter out policies with pendingAction ADD', () => {
            const policies = {
                policy1: {id: 'policy1', name: 'Policy 1', pendingAction: 'add'},
                policy2: {id: 'policy2', name: 'Policy 2'},
                policy3: {id: 'policy3', name: 'Policy 3', pendingAction: 'update'},
            } as unknown as OnyxCollection<Policy>;
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy2', 'policy3']);
        });

        it('should return IDs for all valid non-optimistic policies', () => {
            const policies = {
                policy1: {id: 'policy1', name: 'Policy 1'},
                policy2: {id: 'policy2', name: 'Policy 2'},
                policy3: {id: 'policy3', name: 'Policy 3'},
            } as unknown as OnyxCollection<Policy>;
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy1', 'policy2', 'policy3']);
        });

        it('should include policies with other pendingAction values', () => {
            const policies = {
                policy1: {id: 'policy1', name: 'Policy 1', pendingAction: 'update'},
                policy2: {id: 'policy2', name: 'Policy 2', pendingAction: 'delete'},
                policy3: {id: 'policy3', name: 'Policy 3', pendingAction: null},
                policy4: {id: 'policy4', name: 'Policy 4', pendingAction: undefined},
            } as unknown as OnyxCollection<Policy>;
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy1', 'policy2', 'policy3', 'policy4']);
        });
    });
});
