import Log from '@libs/Log';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates: AnyOnyxUpdate[] = [];
let currentAccountID: number | undefined;

// We use `connectWithoutView` because it is not connected to any UI component.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        currentAccountID = session?.accountID;
    },
});

/**
 * @param updates Onyx updates to queue for later
 */
function queueOnyxUpdates<TKey extends OnyxKey>(updates: Array<OnyxUpdate<TKey>>): Promise<void> {
    queuedOnyxUpdates = queuedOnyxUpdates.concat(updates);

    return Promise.resolve();
}

function flushQueue(): Promise<void> {
    let copyUpdates = [...queuedOnyxUpdates];

    // Clear queue immediately to prevent race conditions with new updates during Onyx processing
    queuedOnyxUpdates = [];

    if (!currentAccountID && !CONFIG.IS_TEST_ENV) {
        const preservedKeys = new Set<OnyxKey>([
            ONYXKEYS.NVP_TRY_NEW_DOT,
            ONYXKEYS.NVP_TRY_FOCUS_MODE,
            ONYXKEYS.PREFERRED_THEME,
            ONYXKEYS.NVP_PREFERRED_LOCALE,
            ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
            ONYXKEYS.SESSION,
            ONYXKEYS.IS_LOADING_APP,
            ONYXKEYS.HAS_LOADED_APP,
            ONYXKEYS.CREDENTIALS,
            ONYXKEYS.RAM_ONLY_IS_SIDEBAR_LOADED,
            ONYXKEYS.ACCOUNT,
            ONYXKEYS.RAM_ONLY_IS_CHECKING_PUBLIC_ROOM,
            ONYXKEYS.MODAL,
            ONYXKEYS.NETWORK,
            ONYXKEYS.PRESERVED_USER_SESSION,
        ]);

        copyUpdates = copyUpdates.filter((update) => preservedKeys.has(update.key as OnyxKey));
    }
    // WRITE requests queue their updates here and advance the lastUpdateID watermark before this deferred flush runs.
    // If the flush fails the updates are lost while the client already claims to be caught up, so surface it in Sentry.
    return Onyx.update(copyUpdates).catch((error: unknown) => {
        Log.alert('[OnyxUpdateManagerError] Deferred WRITE Onyx update failed to apply after the watermark advanced, the updates may be lost', {
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    });
}

function isEmpty() {
    return queuedOnyxUpdates.length === 0;
}

export {queueOnyxUpdates, flushQueue, isEmpty};
