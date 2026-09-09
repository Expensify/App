import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import DateUtils from './DateUtils';

/**
 * Full reconnect: the app fetches all of its data from the server again.
 *
 * The server can ask for one by setting a cutoff time in the Onyx value
 * NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE. If the app last reconnected before that cutoff, its
 * data is stale. The app stores its own last reconnect time in LAST_FULL_RECONNECT_TIME. Both are
 * date strings from DateUtils.getDBTime(), which sort in the same order as the dates they represent,
 * so comparing them as strings is correct.
 */

// The cutoff the client currently holds. Consumers that only need the value (not the change event,
// which subscribeToFullReconnect owns) read it through getServerReconnectCutoff instead of opening
// their own connection. Nothing in the UI shows it, so connectWithoutView is correct here. Do not
// copy this into a component: use useOnyx there so the UI updates when the value changes.
let currentServerReconnectCutoff = '';
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE,
    callback: (value) => {
        currentServerReconnectCutoff = value ?? '';
    },
});

function getServerReconnectCutoff(): string {
    return currentServerReconnectCutoff;
}

/**
 * An empty last reconnect time means the app has never reconnected, so this returns true. An empty
 * cutoff means the server has not asked for one, so this returns false.
 */
function shouldTriggerFullReconnect(lastFullReconnectTime: string, serverReconnectCutoff: string): boolean {
    return lastFullReconnectTime < serverReconnectCutoff;
}

/**
 * The time to write to LAST_FULL_RECONNECT_TIME after a full reconnect. This is the current time, or
 * the server's cutoff if the cutoff is later.
 *
 * If this device's clock is behind the server, the current time can fall before the cutoff. The app
 * would then still read as stale, reconnect right away, and keep repeating. Using the later of the
 * two values stops that loop. A newer cutoff sent later is still greater, so it triggers the next
 * reconnect as normal.
 */
function getLastFullReconnectTimeToRecord(serverReconnectCutoff: string): string {
    const now = DateUtils.getDBTime();
    return now >= serverReconnectCutoff ? now : serverReconnectCutoff;
}

/**
 * The response can deliver a newer cutoff than the one known when the request was built, and the
 * held cutoff can be newer still (a Pusher update can overtake an in-flight response), so the
 * recorded time satisfies whichever of the two is later. A time below either would read as stale
 * and fire an extra reconnect right after the full download.
 *
 * The time is written directly to Onyx (not spliced into the deferred response batch) so
 * subscribeToFullReconnect sees it before any cutoff from the same response can land.
 */
function recordFullReconnectTimeFromResponse(responseOnyxData: AnyOnyxUpdate[] | undefined, knownServerReconnectCutoff: string): Promise<void> {
    const deliveredCutoffValue: unknown = responseOnyxData?.find((update) => update.key === ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE)?.value;
    const deliveredCutoff = typeof deliveredCutoffValue === 'string' ? deliveredCutoffValue : '';
    const cutoffToSatisfy = deliveredCutoff > knownServerReconnectCutoff ? deliveredCutoff : knownServerReconnectCutoff;
    // Written directly to Onyx (not via an action) so subscribeToFullReconnect observes LAST_FULL_RECONNECT_TIME before any cutoff from the same response can land.
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    return Onyx.merge(ONYXKEYS.LAST_FULL_RECONNECT_TIME, getLastFullReconnectTimeToRecord(cutoffToSatisfy));
}

export {shouldTriggerFullReconnect, getLastFullReconnectTimeToRecord, getServerReconnectCutoff, recordFullReconnectTimeFromResponse};
