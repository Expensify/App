/** Keeps the Search snapshot cache bounded by evicting the least recently used snapshots past CONST.SEARCH.MAX_CACHED_SNAPSHOTS */
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchSnapshotAccess} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** How many mounted views show each snapshot. A frozen tab stays mounted, so what it shows survives a switch to another tab */
const shownSnapshotCounts = new Map<string, number>();

/** Each update reads the access record the previous one wrote, so calls fired together don't overwrite each other */
let accessQueue = Promise.resolve();

/** Snapshots outside the most recently used ones of their kind. Pinned and ordinary snapshots are capped separately */
function getEvictedHashes(access: SearchSnapshotAccess): string[] {
    const newestFirst = Object.keys(access)
        .filter((hash) => !shownSnapshotCounts.has(hash))
        .sort((a, b) => access[b].lastAccessed - access[a].lastAccessed);
    const evictedPinned = newestFirst.filter((hash) => access[hash].isPinned).slice(CONST.SEARCH.MAX_CACHED_PINNED_SNAPSHOTS);
    const evictedOrdinary = newestFirst.filter((hash) => !access[hash].isPinned).slice(CONST.SEARCH.MAX_CACHED_SNAPSHOTS);
    return [...evictedPinned, ...evictedOrdinary];
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

/** Marks Search snapshots as just used and evicts the least recently used ones past their cap */
function trackSearchSnapshotAccess(hashes: number[], isPinned = false) {
    accessQueue = accessQueue.then(() => updateSnapshotAccess(hashes, isPinned));
    return accessQueue;
}

/** Marks snapshots as used and keeps them from eviction until the returned function hides them */
function showSearchSnapshots(hashes: number[], isPinned = false) {
    for (const hash of hashes) {
        shownSnapshotCounts.set(String(hash), (shownSnapshotCounts.get(String(hash)) ?? 0) + 1);
    }
    trackSearchSnapshotAccess(hashes, isPinned);

    return () => {
        for (const hash of hashes) {
            const count = shownSnapshotCounts.get(String(hash)) ?? 0;
            if (count > 1) {
                shownSnapshotCounts.set(String(hash), count - 1);
            } else {
                shownSnapshotCounts.delete(String(hash));
            }
        }
    };
}

export {trackSearchSnapshotAccess, showSearchSnapshots};
