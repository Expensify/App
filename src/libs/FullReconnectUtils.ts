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
 * The response of an OpenApp or full-ReconnectApp request can itself deliver a newer server cutoff
 * than the one known when the request was built. The reconnect time in the request's successData was
 * computed from that build-time cutoff, so it can land below the delivered one and the app would read
 * itself as stale right after downloading everything. This recomputes the time from the cutoff the
 * response actually carries and writes it to both places that matter, in place:
 * - into the response's onyxData, right before the cutoff entry, so the two values are saved together
 *   and the reconnect subscription never sees a new cutoff next to an old reconnect time;
 * - into the successData entry (raising it, never lowering), so the later successData write cannot
 *   undo the value seeded above.
 */
function recordFullReconnectTimeFromResponse(responseOnyxData: AnyOnyxUpdate[], successData: AnyOnyxUpdate[] | undefined): void {
    const cutoffIndex = responseOnyxData.findIndex((update) => update.key === ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE);
    const recordedTimeEntry = successData?.find((update) => update.key === ONYXKEYS.LAST_FULL_RECONNECT_TIME);
    if (cutoffIndex === -1 || !recordedTimeEntry) {
        return;
    }

    const deliveredCutoffValue: unknown = responseOnyxData.at(cutoffIndex)?.value;
    const deliveredCutoff = typeof deliveredCutoffValue === 'string' ? deliveredCutoffValue : '';
    const timeForDeliveredCutoff = getLastFullReconnectTimeToRecord(deliveredCutoff);
    const buildTimeValue = typeof recordedTimeEntry.value === 'string' ? recordedTimeEntry.value : '';
    const valueToRecord = timeForDeliveredCutoff >= buildTimeValue ? timeForDeliveredCutoff : buildTimeValue;

    recordedTimeEntry.value = valueToRecord;
    responseOnyxData.splice(cutoffIndex, 0, {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.LAST_FULL_RECONNECT_TIME, value: valueToRecord});
}

export {shouldTriggerFullReconnect, getLastFullReconnectTimeToRecord, recordFullReconnectTimeFromResponse};
