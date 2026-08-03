import ONYXKEYS from '@src/ONYXKEYS';

import waitForOnyxValue from './waitForOnyxValue';

/**
 * Waits until the account data delivered by OpenApp is authoritative. HAS_LOADED_APP covers the
 * first load after sign-in, while IS_LOADING_APP covers later account switches that preserve
 * HAS_LOADED_APP. The final microtask lets the complete OpenApp Onyx batch settle because callback
 * order within the batch is not guaranteed.
 *
 * HAS_LOADED_APP persists across restarts, so after a relaunch this resolves with the persisted
 * account data while ReconnectApp may still be in flight. The wait guarantees hydrated data, not
 * fresh data. Reconciling credentials revoked while the app was closed belongs to the recovery
 * flow.
 */
async function waitForAccountDataReady(signal?: AbortSignal): Promise<void> {
    await Promise.all([
        waitForOnyxValue(ONYXKEYS.HAS_LOADED_APP, (hasLoadedApp) => hasLoadedApp === true, signal),
        waitForOnyxValue(ONYXKEYS.IS_LOADING_APP, (isLoadingApp) => isLoadingApp === false, signal),
    ]);
    await Promise.resolve();
}

export default waitForAccountDataReady;
