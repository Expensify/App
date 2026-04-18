import {waitFor} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import '@libs/Navigation/AppNavigator/AuthScreens';
import Navigation from '@libs/Navigation/Navigation';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import * as App from '../../src/libs/actions/App';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import type Request from '../../src/types/onyx/Request';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');

OnyxUpdateManager();

describe('actions/App', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('lastFullReconnectTime - openApp', async () => {
        // When Open App runs
        App.openApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - full reconnectApp', async () => {
        // When a full ReconnectApp runs
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        App.reconnectApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - incremental reconnectApp', async () => {
        // When an incremental ReconnectApp runs
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        App.reconnectApp(123);
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should NOT be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeUndefined();
    });

    test('trigger full reconnect', async () => {
        const reconnectApp = jest.spyOn(App, 'reconnectApp');

        // When OpenApp runs
        App.openApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();

        // And when a new reconnectAppIfFullReconnectBefore is received
        Onyx.set(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, DateUtils.getDBTime());
        await waitForBatchedUpdates();

        // Then ReconnectApp should get called with no updateIDFrom to perform a full reconnect
        expect(reconnectApp).toHaveBeenCalledTimes(1);
        expect(reconnectApp).toHaveBeenCalledWith();
    });

    test("don't trigger full reconnect", async () => {
        const reconnectApp = jest.spyOn(App, 'reconnectApp');

        // When OpenApp runs
        App.openApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();

        // And when a reconnectAppIfFullReconnectBefore is received with a timestamp in the past
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        Onyx.set(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, DateUtils.getDBTime(yesterday.toISOString()));
        await waitForBatchedUpdates();

        // Then ReconnectApp should NOT get called
        expect(reconnectApp).toHaveBeenCalledTimes(0);
    });

    test('clearOnyxAndResetApp preserves rolled-back ongoing requests across reset', async () => {
        const persistedRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'AddComment',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
            requestID: 123,
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
                        requestID: 123,
                        isRollback: true,
                    }),
                ]),
            );
            expect((await getOnyxValue(ONYXKEYS.PERSISTED_ONGOING_REQUESTS)) == null).toBe(true);
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
