/** Keeps the Search snapshot cache bounded by evicting the least recently used snapshots past CONST.SEARCH.MAX_CACHED_SNAPSHOTS */
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchSnapshotAccess} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** When the Search page opened its query. Snapshots used since then (the query and its expanded groups) are on screen and can't be evicted */
let currentPageOpenedAt = Infinity;

/** Each update reads the access record the previous one wrote, so calls fired together don't overwrite each other */
let accessQueue = Promise.resolve();

/** Unpinned snapshots outside the most recently used MAX_CACHED_SNAPSHOTS */
function getEvictedHashes(access: SearchSnapshotAccess): string[] {
    return Object.keys(access)
        .filter((hash) => access[hash].lastAccessed < currentPageOpenedAt && !access[hash].isPinned)
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
    currentPageOpenedAt = Date.now();
    return trackSearchSnapshotAccess([hash], isPinned);
}

/** Lets the snapshots the Search page used be evicted again once it shows another query or closes */
function leaveSearchPage() {
    currentPageOpenedAt = Infinity;
}

/** Returns the snapshot of a saved search that was edited or deleted to the evictable pool */
function unpinSearchSnapshot(hash: number) {
    accessQueue = accessQueue.then(async () => {
        const access = await readOnceOnyxValue(ONYXKEYS.SEARCH_SNAPSHOT_ACCESS);
        if (!access?.[hash]) {
            return;
        }
        await Onyx.merge(ONYXKEYS.SEARCH_SNAPSHOT_ACCESS, {[hash]: {isPinned: false}}).catch((error: unknown) =>
            Log.hmmm('[Search] failed to unpin a cached snapshot', {error: String(error)}),
        );
    });
    return accessQueue;
}

export {trackSearchSnapshotAccess, trackSearchPageSnapshotAccess, leaveSearchPage, unpinSearchSnapshot};
