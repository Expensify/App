/** Keeps the Search snapshot cache bounded by evicting the least recently used snapshots past CONST.SEARCH.MAX_CACHED_SNAPSHOTS */
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchSnapshotAccess} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** The query the Search page shows. Its rows' searches (e.g. expanded groups) must not evict it */
let currentPageHash: string | undefined;

/** Each update reads the access record the previous one wrote, so calls fired together don't overwrite each other */
let accessQueue = Promise.resolve();

/** Unpinned snapshots outside the most recently used MAX_CACHED_SNAPSHOTS */
function getEvictedHashes(access: SearchSnapshotAccess): string[] {
    return Object.keys(access)
        .filter((hash) => hash !== currentPageHash && !access[hash].isPinned)
        .sort((a, b) => access[b].lastAccessed - access[a].lastAccessed)
        .slice(CONST.SEARCH.MAX_CACHED_SNAPSHOTS);
}

async function updateSnapshotAccess(hashes: number[], isPinned: boolean) {
    try {
        const access: SearchSnapshotAccess = {...(await readOnceOnyxValue(ONYXKEYS.SEARCH_SNAPSHOT_ACCESS))};
        const accessUpdate: Record<string, SearchSnapshotAccess[string] | null> = {};
        const onyxUpdates: Array<OnyxUpdate<typeof ONYXKEYS.SEARCH_SNAPSHOT_ACCESS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];

        const lastAccessed = Date.now();
        for (const hash of hashes) {
            access[hash] = {lastAccessed, isPinned: isPinned || !!access[hash]?.isPinned};
            accessUpdate[hash] = access[hash];
        }

        for (const hash of getEvictedHashes(access)) {
            accessUpdate[hash] = null;
            onyxUpdates.push({onyxMethod: Onyx.METHOD.SET, key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, value: null});
        }

        onyxUpdates.push({onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SEARCH_SNAPSHOT_ACCESS, value: accessUpdate});
        await Onyx.update(onyxUpdates);
    } catch (error) {
        Log.hmmm('[Search] failed to evict cached snapshots', {error: String(error)});
    }
}

/** Marks Search snapshots as just used and evicts the least recently used unpinned snapshots past the cap */
function trackSearchSnapshotAccess(hashes: number[], isPinned = false) {
    accessQueue = accessQueue.then(() => updateSnapshotAccess(hashes, isPinned));
    return accessQueue;
}

/** Same as trackSearchSnapshotAccess, for the query the Search page shows */
function trackSearchPageSnapshotAccess(hash: number, isPinned: boolean) {
    currentPageHash = hash.toString();
    return trackSearchSnapshotAccess([hash], isPinned);
}

export {trackSearchSnapshotAccess, trackSearchPageSnapshotAccess};
