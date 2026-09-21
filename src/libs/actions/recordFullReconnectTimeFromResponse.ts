import {getLastFullReconnectTimeToRecord} from '@libs/FullReconnectUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/**
 * Records LAST_FULL_RECONNECT_TIME after a successful full download.
 *
 * The response can deliver a newer cutoff than the one known when the request was built, and the
 * held cutoff can be newer still (a Pusher update can overtake an in-flight response), so the
 * recorded time satisfies whichever of the two is later. A time below either would read as stale
 * and fire an extra reconnect right after the full download.
 *
 * The caller awaits this before the response reaches Onyx, so subscribeToFullReconnect sees the
 * recorded time before any cutoff from the same response can land.
 */
function recordFullReconnectTimeFromResponse(responseOnyxData: AnyOnyxUpdate[] | undefined, knownServerReconnectCutoff: string): Promise<void> {
    const deliveredCutoffValue: unknown = responseOnyxData?.find((update) => update.key === ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE)?.value;
    const deliveredCutoff = typeof deliveredCutoffValue === 'string' ? deliveredCutoffValue : '';
    const cutoffToSatisfy = deliveredCutoff > knownServerReconnectCutoff ? deliveredCutoff : knownServerReconnectCutoff;
    return Onyx.merge(ONYXKEYS.LAST_FULL_RECONNECT_TIME, getLastFullReconnectTimeToRecord(cutoffToSatisfy));
}

export default recordFullReconnectTimeFromResponse;
