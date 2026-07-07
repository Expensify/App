import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// In this file we manage a queue of Onyx updates while the SequentialQueue is processing. There are functions to get the updates and clear the queue after saving the updates in Onyx.

let queuedOnyxUpdates: AnyOnyxUpdate[] = [];
let currentAccountID: number | undefined;

// FIX #82013: Collections that OpenReport returns for a public room the anonymous (signed-out) deeplink is opening.
// When the flushed batch itself establishes the anonymous session we widen the stale-data allow-list to these keys
// (plus PERSONAL_DETAILS_LIST) so the room renders, while every unrelated collection stays filtered.
const ANONYMOUS_SESSION_ALLOWED_COLLECTIONS: OnyxKey[] = [
    ONYXKEYS.COLLECTION.REPORT,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    ONYXKEYS.COLLECTION.REPORT_METADATA,
    ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ONYXKEYS.COLLECTION.POLICY,
];

// We use `connectWithoutView` because it is not connected to any UI component.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        // FIX #82013: when the account is lost (sign-out / session cleared), drop any buffered updates so old-account
        // data can't ride through the anonymous-session allow-list in flushQueue() on a later signed-out deeplink.
        // Doing it here covers every account-loss path, not just the explicit cleanupSession() call.
        if (currentAccountID !== undefined && session?.accountID === undefined) {
            clear();
        }
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

        // FIX #82013: The signed-out public-room deeplink flow flushes while currentAccountID is still undefined,
        // because OpenReport returns the anonymous SESSION and the room's data in the same batch. When the batch
        // itself establishes the anonymous session we keep the stale-data filter (#48427/#52822) active for every
        // unrelated key, but additionally allow the report-family + personal-details + policy keys the room needs —
        // instead of dropping the filter for the whole batch. (The buffer is cleared on account-loss above, so no
        // stale cross-account data can be present when this anonymous batch flushes.)
        const establishesAnonymousSession = copyUpdates.some((update) => {
            if (update.key !== ONYXKEYS.SESSION) {
                return false;
            }
            // `update.value` is `any`; narrow through `unknown` and check the anonymous authTokenType. This mirrors
            // Session.isAnonymousUser — we don't import it here because it lives in the heavy Session action module,
            // and pulling that whole module into this low-level queue file breaks module init (and even the unit test).
            const sessionValue: unknown = update.value;
            return typeof sessionValue === 'object' && sessionValue !== null && 'authTokenType' in sessionValue && sessionValue.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
        });

        copyUpdates = copyUpdates.filter((update) => {
            const key = update.key as OnyxKey;
            if (preservedKeys.has(key)) {
                return true;
            }
            if (!establishesAnonymousSession) {
                return false;
            }
            return key === ONYXKEYS.PERSONAL_DETAILS_LIST || ANONYMOUS_SESSION_ALLOWED_COLLECTIONS.some((collectionKey) => key.startsWith(collectionKey));
        });
    }
    return Onyx.update(copyUpdates);
}

function isEmpty() {
    return queuedOnyxUpdates.length === 0;
}

/**
 * FIX #82013: Discard any queued updates without applying them. Called from the SESSION listener above whenever the
 * account is lost, so the buffer cannot carry stale, old-account updates into a later anonymous session (the
 * signed-out public-room deeplink flow), where flushQueue() widens the stale-data allow-list for the batch that
 * establishes the anonymous session. Also exported for unit tests.
 */
function clear() {
    queuedOnyxUpdates = [];
}

export {queueOnyxUpdates, flushQueue, isEmpty, clear};
