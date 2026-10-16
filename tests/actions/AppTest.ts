import {waitFor} from '@testing-library/react-native';

import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

import CONST from '@src/CONST';
import '@libs/Navigation/AppNavigator/AuthScreens';

import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DismissedProductTraining, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type Request from '../../src/types/onyx/Request';
import type {MockFetch} from '../utils/TestHelper';

import * as App from '../../src/libs/actions/App';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');

function mockRead() {
    return jest.spyOn(API, 'read').mockImplementation(() => {});
}

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

    test('openApp is not deduped against an in-flight OpenApp when it carries preservation data', async () => {
        const writeOpenApp = jest.spyOn(API, 'writeWithNoDuplicatesOpenAppConflictAction').mockImplementation(() => Promise.resolve());

        App.openApp();
        await waitForBatchedUpdates();
        expect(writeOpenApp).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), true);

        App.openApp(true);
        await waitForBatchedUpdates();
        expect(writeOpenApp).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), false);

        App.openApp(false, {[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}1`]: 'a draft'});
        await waitForBatchedUpdates();
        expect(writeOpenApp).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), false);
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

    test('two reconnects the queue merges into one send one SearchForTodos', async () => {
        const read = mockRead();
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);

        // Offline holds the queue, so the first reconnect is still in it when the second arrives
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});

        App.reconnectApp();
        await waitForBatchedUpdates();
        App.reconnectApp();
        await waitForBatchedUpdates();

        // The queue kept one ReconnectApp and nothing has reached the server, so no read went out
        expect(PersistedRequests.getAll()).toHaveLength(1);
        expect(read).not.toHaveBeenCalled();

        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        SequentialQueue.flush();
        await waitForBatchedUpdates();

        // The one response that came back sent the one read
        expect(read).toHaveBeenCalledTimes(1);
        expect(read).toHaveBeenCalledWith(READ_COMMANDS.SEARCH_FOR_TODOS, null);
    });

    test('a ReconnectApp restored from a previous session sends SearchForTodos when it drains', async () => {
        const read = mockRead();
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);

        // No caller is waiting on this one — it was persisted by a session that is gone
        await PersistedRequests.save({command: WRITE_COMMANDS.RECONNECT_APP, data: {}} as Request<never>);
        SequentialQueue.flush();
        await waitForBatchedUpdates();

        expect(read).toHaveBeenCalledTimes(1);
        expect(read).toHaveBeenCalledWith(READ_COMMANDS.SEARCH_FOR_TODOS, null);
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

    test.each<{scenario: string; dismissedTraining: Partial<DismissedProductTraining>}>([
        {
            scenario: 'existing product-training dismissals',
            dismissedTraining: {
                [CONST.AI_FEATURES_PROMO_MODAL]: {timestamp: '2026-10-01 12:00:00', dismissedMethod: 'x'},
                [CONST.MIGRATED_USER_WELCOME_MODAL]: {timestamp: '2026-10-01 12:00:00', dismissedMethod: 'click'},
                [CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_LHN_GBR]: {timestamp: '2026-10-01 12:00:00', dismissedMethod: 'x'},
            },
        },
        {scenario: 'an empty product-training dismissal record', dismissedTraining: {}},
    ])('clearOnyxAndResetApp preserves $scenario through repeated cache resets', async ({dismissedTraining}) => {
        // Given saved training state for the signed-in account and an offline connection that delays OpenApp.
        jest.spyOn(Navigation, 'clearPreloadedRoutes').mockImplementation(() => {});
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: 123, authToken: 'test-token'},
            [ONYXKEYS.NETWORK]: {shouldForceOffline: true},
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: dismissedTraining,
        });
        await waitForBatchedUpdates();

        for (let reset = 0; reset < 2; reset++) {
            // When the user clears the cache again before the server restores account data.
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}123`, 'cached draft');
            await App.clearOnyxAndResetApp();
            await waitForBatchedUpdates();

            // Then training state survives immediately, while ordinary cached data is cleared.
            await expect(getOnyxValue(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING)).resolves.toEqual(dismissedTraining);
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}123`)).resolves.toBeUndefined();
            await expect(getOnyxValue(ONYXKEYS.IS_LOADING_APP)).resolves.toBe(true);

            // When initial loading finishes before the training data arrives, the saved state still exists.
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
            await waitForBatchedUpdates();
            await expect(getOnyxValue(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING)).resolves.toEqual(dismissedTraining);
        }
    });

    test('clearOnyxAndResetApp discards imported training dismissals when restoring the original account', async () => {
        // Given an imported account's training state and a different original account to restore.
        jest.spyOn(Navigation, 'clearPreloadedRoutes').mockImplementation(() => {});
        mockFetch.pause();
        try {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: 456, authToken: 'imported-token'},
                [ONYXKEYS.PRESERVED_USER_SESSION]: {accountID: 123, authToken: 'original-token'},
                [ONYXKEYS.IS_USING_IMPORTED_STATE]: true,
                [ONYXKEYS.NETWORK]: {shouldForceOffline: true},
                [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {
                    [CONST.AI_FEATURES_PROMO_MODAL]: {timestamp: '2026-10-01 12:00:00', dismissedMethod: 'x'},
                },
            });
            await waitForBatchedUpdates();

            // When clearing imported state before OpenApp restores the original account's training data.
            await App.clearOnyxAndResetApp();
            await waitForBatchedUpdates();

            // Then the original session is restored without inheriting the imported account's dismissals.
            await expect(getOnyxValue(ONYXKEYS.SESSION)).resolves.toEqual(expect.objectContaining({accountID: 123, authToken: 'original-token'}));
            await expect(getOnyxValue(ONYXKEYS.IS_USING_IMPORTED_STATE)).resolves.toBe(false);
            await expect(getOnyxValue(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING)).resolves.toBeUndefined();
        } finally {
            await mockFetch.resume();
        }
    });

    describe('getNonOptimisticPolicyIDs', () => {
        it('should return empty array when policies is empty object', () => {
            const result = App.getNonOptimisticPolicyIDs({});
            expect(result).toEqual([]);
        });

        it('should filter out undefined policies', () => {
            const policies = createMock<OnyxCollection<Policy>>({
                policy1: {id: 'policy1', name: 'Policy 1'},
                policy2: undefined,
                policy3: {id: 'policy3', name: 'Policy 3'},
            });
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy1', 'policy3']);
        });

        it('should filter out policies with pendingAction ADD', () => {
            const policies = createMock<OnyxCollection<Policy>>({
                policy1: {id: 'policy1', name: 'Policy 1', pendingAction: 'add'},
                policy2: {id: 'policy2', name: 'Policy 2'},
                policy3: {id: 'policy3', name: 'Policy 3', pendingAction: 'update'},
            });
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy2', 'policy3']);
        });

        it('should return IDs for all valid non-optimistic policies', () => {
            const policies = createMock<OnyxCollection<Policy>>({
                policy1: {id: 'policy1', name: 'Policy 1'},
                policy2: {id: 'policy2', name: 'Policy 2'},
                policy3: {id: 'policy3', name: 'Policy 3'},
            });
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy1', 'policy2', 'policy3']);
        });

        it('should include policies with other pendingAction values', () => {
            const policies = createMock<OnyxCollection<Policy>>({
                policy1: {id: 'policy1', name: 'Policy 1', pendingAction: 'update'},
                policy2: {id: 'policy2', name: 'Policy 2', pendingAction: 'delete'},
                policy3: {id: 'policy3', name: 'Policy 3', pendingAction: null},
                policy4: {id: 'policy4', name: 'Policy 4', pendingAction: undefined},
            });
            const result = App.getNonOptimisticPolicyIDs(policies);
            expect(result).toEqual(['policy1', 'policy2', 'policy3', 'policy4']);
        });
    });
});
