import DateUtils from '@libs/DateUtils';
import clearPrefetchOnAppStart from '@libs/Prefetch/clearPrefetchOnAppStart';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Atomically clears Onyx while seeding LAST_FULL_RECONNECT_TIME=now so that
 * subscribeToFullReconnect doesn't fire a redundant ReconnectApp when the caller
 * runs an OpenApp right after the clear: OpenApp's response.onyxData carries
 * NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE and applyHTTPSOnyxUpdates applies
 * response.onyxData before successData, so without the seed the timestamp would
 * still be empty when the comparison runs and trigger a duplicate reconnect.
 *
 * Pass `extraSeeds` to seed additional keys atomically with the timestamp (e.g.
 * IS_LOADING_APP=true for delegate transitions). Seeded keys are appended to the
 * preserve list automatically so they survive the clear.
 */
async function clearOnyxAndSeedFullReconnect(keysToPreserve: OnyxKey[], extraSeeds?: OnyxMultiSetInput): Promise<void> {
    // Any Onyx reset can preserve or replace SESSION/CREDENTIALS while dropping account-scoped data.
    // Clear native startup prefetches so a cold start cannot replay requests from the previous identity.
    await clearPrefetchOnAppStart();

    const seeds: OnyxMultiSetInput = {
        ...extraSeeds,
        [ONYXKEYS.LAST_FULL_RECONNECT_TIME]: DateUtils.getDBTime(),
    };
    await Onyx.multiSet(seeds);
    await Onyx.clear([...keysToPreserve, ...(Object.keys(seeds) as OnyxKey[])]);

    // A request can be processed between the initial cleanup and the Onyx reset. Clear the queue again after the old credentials are gone.
    await clearPrefetchOnAppStart();
}

export default clearOnyxAndSeedFullReconnect;
