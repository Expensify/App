import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

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
        // FIX #82013: If this queued batch itself establishes the ANONYMOUS session (it contains a SESSION
        // update carrying an authToken whose authTokenType is anonymous), every other update in the batch
        // belongs to that newly-established session and cannot be the stale cross-account replay that
        // #48427/#52822 guard against. This is the signed-out public-room deeplink flow: OpenReport returns
        // the anonymous SESSION and the report_* collection data in the same batch. Without this bypass the
        // report data is filtered out and deeplink navigation hangs. We gate on the anonymous authTokenType
        // (not just any authToken) so the stale-data protection stays intact for every other flow.
        const establishesAnonymousSession = copyUpdates.some((update) => {
            if (update.key !== ONYXKEYS.SESSION) {
                return false;
            }
            // `update.value` is typed as `any`; narrow through `unknown` so we avoid an unsafe assertion.
            const sessionValue: unknown = update.value;
            return (
                typeof sessionValue === 'object' &&
                sessionValue !== null &&
                'authToken' in sessionValue &&
                !!sessionValue.authToken &&
                'authTokenType' in sessionValue &&
                sessionValue.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS
            );
        });

        if (!establishesAnonymousSession) {
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
    }
    return Onyx.update(copyUpdates);
}

function isEmpty() {
    return queuedOnyxUpdates.length === 0;
}

/**
 * FIX #82013: Discard any queued updates without applying them. Called from cleanupSession() on sign-out so the
 * buffer cannot carry stale, old-account updates into a later anonymous session (the signed-out public-room
 * deeplink flow), where flushQueue() bypasses the no-account stale-data filter for the batch that establishes
 * the anonymous session. Without clearing here, old-account updates left in the buffer would ride through that
 * bypass and be merged into the new anonymous session.
 */
function clear() {
    queuedOnyxUpdates = [];
}

export {queueOnyxUpdates, flushQueue, isEmpty, clear};
