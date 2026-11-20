import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Snapshots cached before their use was tracked can't be evicted, so they're dropped once. They're a cache, and Search fetches them again when opened.
 */
export default async function ClearUntrackedSearchSnapshots(): Promise<void> {
    if ((await readOnceOnyxValue(ONYXKEYS.SEARCH_SNAPSHOT_ACCESS)) !== undefined) {
        return;
    }
    await Onyx.update([
        {onyxMethod: Onyx.METHOD.SET_COLLECTION, key: ONYXKEYS.COLLECTION.SNAPSHOT, value: {}},
        {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.SEARCH_SNAPSHOT_ACCESS, value: {}},
    ]);
    Log.info('[Migrate Onyx] Ran ClearUntrackedSearchSnapshots migration');
}
