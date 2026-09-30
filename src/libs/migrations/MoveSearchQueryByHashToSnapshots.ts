/* eslint-disable @typescript-eslint/no-deprecated -- draining SEARCH_QUERY_BY_HASH is this file's entire purpose */
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Snapshots cached by older versions only have their query in SEARCH_QUERY_BY_HASH. Copy it onto `search.inputQuery`
 * so optimistic expenses keep reaching them. Hashes without a cached snapshot are dropped, so no partial snapshot is created.
 */
export default async function MoveSearchQueryByHashToSnapshots(): Promise<void> {
    const searchQueryByHash = await readOnceOnyxValue(ONYXKEYS.SEARCH_QUERY_BY_HASH);
    if (searchQueryByHash === undefined) {
        return;
    }

    const snapshots = await readOnceOnyxValue(ONYXKEYS.COLLECTION.SNAPSHOT);
    const updates: Array<OnyxUpdate<typeof ONYXKEYS.SEARCH_QUERY_BY_HASH | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.SEARCH_QUERY_BY_HASH, value: null},
    ];
    for (const [hash, inputQuery] of Object.entries(searchQueryByHash ?? {})) {
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` as const;
        const snapshot = snapshots?.[snapshotKey];
        if (!inputQuery || !snapshot?.search || snapshot.search.inputQuery) {
            continue;
        }
        updates.push({onyxMethod: Onyx.METHOD.MERGE, key: snapshotKey, value: {search: {inputQuery}}});
    }

    await Onyx.update(updates);
    Log.info('[Migrate Onyx] Ran MoveSearchQueryByHashToSnapshots migration');
}
