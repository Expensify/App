import * as App from '@libs/actions/App';
import clearOnyxAndSeedFullReconnect from '@libs/actions/clearOnyxAndSeedFullReconnect';
import {WRITE_COMMANDS} from '@libs/API/types';
import {resetQueue, waitForIdle} from '@libs/Network/SequentialQueue';

import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as PersistedRequests from '@src/libs/actions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

describe('IS_LOADING_APP stranded true', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        // Onyx.clear does not reset these module-level singletons, so reset them explicitly
        // to keep the tests order-independent: the request queue, the sequential queue, and
        // the NetworkState offline flag (forced offline by the stranding test below).
        await PersistedRequests.clear();
        resetQueue();
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        await waitForBatchedUpdates();
    });

    it('stays true when the OpenApp that should clear it never settles, and is stranded once that request is lost', async () => {
        // The app was already loaded in a previous session and the client is offline.
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);

        // IS_LOADING_APP=true is persisted as a standalone write, decoupled from any request (this is how
        // both openApp's optimisticData and clearOnyxForDelegateTransition write it). Only finallyData of
        // the OpenApp/ReconnectApp family clears it.
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdates();
        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(true);

        // An OpenApp is queued to clear the flag. Offline, so it persists but never flushes.
        App.openApp();
        await waitForBatchedUpdates();

        // OpenApp is queued (its finallyData would set the flag false on completion) ...
        expect(PersistedRequests.getAll().some((request) => request.command === WRITE_COMMANDS.OPEN_APP)).toBe(true);
        // ... but the flag is still true because finallyData has not run.
        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(true);

        // The queued OpenApp is lost before it ever settles (e.g. the session was interrupted after the
        // request left the queue but before its finallyData was applied). Nothing is left to clear the flag.
        await PersistedRequests.clear();
        resetQueue();
        await waitForBatchedUpdates();

        // Stranded: no OpenApp left in the queue, the backend never sets this key, and the app is
        // "loaded" so nothing re-fires OpenApp.
        expect(PersistedRequests.getAll().some((request) => request.command === WRITE_COMMANDS.OPEN_APP)).toBe(false);
        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(true);
    });

    it('is healed by the next successful ReconnectApp', async () => {
        // A previous session stranded the flag on disk and the app booted from it.
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdates();

        // Boot with HAS_LOADED_APP set runs ReconnectApp, never OpenApp.
        App.reconnectApp();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(false);
    });

    it('marks product marketing data ready after a successful OpenApp queue flush', async () => {
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'open-app-reset', readyIDs: {}});
        await waitForBatchedUpdates();

        App.openApp();
        await waitForIdle();
        await waitForBatchedUpdates();

        const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).toBe(true);
    });

    it('stays gated when OpenApp fails and reopens after a successful full ReconnectApp', async () => {
        const failedFetch = TestHelper.createGlobalFetchMock();
        failedFetch.fail();
        global.fetch = failedFetch;

        await clearOnyxAndSeedFullReconnect([]);
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        await waitForBatchedUpdates();

        App.openApp();
        await waitForIdle();
        await waitForBatchedUpdates();

        let dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).not.toBe(true);

        failedFetch.succeed();
        App.reconnectApp();
        await waitForBatchedUpdates();
        await waitForIdle();
        await waitForBatchedUpdates();

        dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).toBe(true);
    });

    it('keeps product marketing gated after a successful partial ReconnectApp', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE]: {resetID: 'partial-reset', readyIDs: {}},
        });
        await waitForBatchedUpdates();

        App.reconnectApp(123);
        await waitForBatchedUpdates();
        await waitForIdle();
        await waitForBatchedUpdates();

        const dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[dataState?.resetID ?? '']).not.toBe(true);
    });

    it('does not let an OpenApp from before a reset ready the pending generation, which recovers through its own OpenApp', async () => {
        const delayedFetch = TestHelper.createGlobalFetchMock();
        delayedFetch.pause();
        global.fetch = delayedFetch;
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'old-pending-reset', readyIDs: {'old-pending-reset': true}});
        await waitForBatchedUpdates();

        App.openApp();
        await waitForBatchedUpdates();
        await clearOnyxAndSeedFullReconnect([]);
        await waitForBatchedUpdates();
        const stateAfterReset = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(stateAfterReset?.resetID).toEqual(expect.any(String));
        expect(stateAfterReset?.resetID).not.toBe('');
        expect(stateAfterReset?.readyIDs?.[stateAfterReset?.resetID ?? '']).not.toBe(true);

        await delayedFetch.resume();
        await waitForIdle();
        await waitForBatchedUpdates();
        let dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[stateAfterReset?.resetID ?? '']).not.toBe(true);

        App.openApp();
        await waitForIdle();
        await waitForBatchedUpdates();
        dataState = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(dataState?.readyIDs?.[stateAfterReset?.resetID ?? '']).toBe(true);
    });

    it('does not let an OpenApp that began before an account reset close a newer ready generation', async () => {
        const delayedFetch = TestHelper.createGlobalFetchMock();
        delayedFetch.pause();
        global.fetch = delayedFetch;
        await Onyx.set(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {resetID: 'old-reset', readyIDs: {'old-reset': true}});
        await waitForBatchedUpdates();

        App.openApp();
        await waitForBatchedUpdates();
        await clearOnyxAndSeedFullReconnect([]);
        await waitForBatchedUpdates();
        const stateAfterReset = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(stateAfterReset?.resetID).toEqual(expect.any(String));
        expect(stateAfterReset?.resetID).not.toBe('');
        expect(stateAfterReset?.resetID).not.toBe('old-reset');
        await Onyx.merge(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE, {readyIDs: {[stateAfterReset?.resetID ?? '']: true}});
        await waitForBatchedUpdates();

        await delayedFetch.resume();
        await waitForIdle();
        await waitForBatchedUpdates();

        const stateAfterStaleSuccess = await getOnyxValue(ONYXKEYS.PRODUCT_MARKETING_WINDOW_DATA_STATE);
        expect(stateAfterStaleSuccess?.resetID).toBe(stateAfterReset?.resetID);
        expect(stateAfterStaleSuccess?.readyIDs?.[stateAfterStaleSuccess?.resetID ?? '']).toBe(true);
    });
});
