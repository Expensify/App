import Onyx from 'react-native-onyx';
import type {OnyxKey, OnyxMultiSetInput} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';

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
function clearOnyxAndSeedFullReconnect(keysToPreserve: OnyxKey[], extraSeeds?: OnyxMultiSetInput): Promise<void> {
    const seeds: OnyxMultiSetInput = {
        ...extraSeeds,
        [ONYXKEYS.LAST_FULL_RECONNECT_TIME]: DateUtils.getDBTime(),
    };
    return Onyx.multiSet(seeds).then(() => Onyx.clear([...keysToPreserve, ...(Object.keys(seeds) as OnyxKey[])]));
}

export default clearOnyxAndSeedFullReconnect;
