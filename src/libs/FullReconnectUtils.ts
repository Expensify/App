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

// The cutoff the client currently holds. subscribeToFullReconnect owns reacting to changes; this
// only exposes the current value. Nothing in the UI reads it, so connectWithoutView is correct
// here; components should use useOnyx instead.
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
 * Records LAST_FULL_RECONNECT_TIME into the response's onyxData. The response can deliver a newer
 * cutoff than the one known when the request was built, and the held cutoff can be newer still (a
 * Pusher update can overtake an in-flight response), so the recorded time satisfies whichever of
 * the two is later. A time below either would read as stale and fire an extra reconnect right
 * after the full download.
 *
 * The entry goes right before the delivered cutoff entry, so the reconnect subscription never sees
 * a new cutoff next to an old reconnect time. That assumes Onyx broadcasts a batch's merges in
 * array order: true today because both keys are cache-resident (see subscribeToFullReconnect.ts),
 * and pinned by the SubscribeToFullReconnect e2e test. If it ever broke, the worst case is one
 * transient extra reconnect, never a loop.
 */
function recordFullReconnectTimeFromResponse(responseOnyxData: AnyOnyxUpdate[], knownServerReconnectCutoff: string): void {
    const cutoffIndex = responseOnyxData.findIndex((update) => update.key === ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE);
    const deliveredCutoffValue: unknown = cutoffIndex === -1 ? undefined : responseOnyxData.at(cutoffIndex)?.value;
    const deliveredCutoff = typeof deliveredCutoffValue === 'string' ? deliveredCutoffValue : '';
    const cutoffToSatisfy = deliveredCutoff > knownServerReconnectCutoff ? deliveredCutoff : knownServerReconnectCutoff;
    const insertionIndex = cutoffIndex === -1 ? responseOnyxData.length : cutoffIndex;
    responseOnyxData.splice(insertionIndex, 0, {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.LAST_FULL_RECONNECT_TIME, value: getLastFullReconnectTimeToRecord(cutoffToSatisfy)});
}

export {shouldTriggerFullReconnect, getLastFullReconnectTimeToRecord, getServerReconnectCutoff, recordFullReconnectTimeFromResponse};
