import {trackSearchPageSnapshotAccess, trackSearchSnapshotAccess} from '@libs/actions/SearchSnapshotCache';
import ClearUntrackedSearchSnapshots from '@libs/migrations/ClearUntrackedSearchSnapshots';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const MAX = CONST.SEARCH.MAX_CACHED_SNAPSHOTS;

function getSnapshotHashes(): Promise<number[]> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.SNAPSHOT,
            callback: (snapshots) => {
                connection.unsubscribe();
                resolve(
                    Object.keys(snapshots ?? {})
                        .map((key) => Number(key.slice(ONYXKEYS.COLLECTION.SNAPSHOT.length)))
                        .sort((a, b) => a - b),
                );
            },
        });
    });
}

function writeSnapshot(hash: number) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {search: {hash}});
}

async function cacheSearches(hashes: number[], isPinned = false) {
    await Promise.all(hashes.map(writeSnapshot));
    await Promise.all(hashes.map((hash) => trackSearchSnapshotAccess([hash], isPinned)));
}

function range(start: number, count: number): number[] {
    return Array.from({length: count}, (_, index) => start + index);
}

describe('trackSearchSnapshotAccess', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        // Each access gets a distinct, later time so recency order is deterministic
        let now = 0;
        jest.spyOn(Date, 'now').mockImplementation(() => ++now);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('evicts the least recently used snapshots past the cap', async () => {
        // Given An empty cache
        // When More distinct searches run at once than the cap allows, each newer than the last
        await cacheSearches(range(1, MAX + 3));

        // Then Only the most recent ones stay cached, so storage stops growing with every new query
        expect(await getSnapshotHashes()).toEqual(range(4, MAX));
    });

    it('keeps a revisited search over ones used after it was first opened', async () => {
        // Given A full cache whose oldest search is opened again
        await cacheSearches(range(1, MAX));
        await trackSearchSnapshotAccess([1]);

        // When A new search pushes the cache over the cap
        await cacheSearches([MAX + 1]);

        // Then The revisit refreshed its recency, so the next oldest is evicted instead
        const hashes = await getSnapshotHashes();
        expect(hashes).toContain(1);
        expect(hashes).not.toContain(2);
    });

    it('never evicts saved or suggested searches and keeps them outside the cap', async () => {
        // Given A pinned search opened before a full cache of ordinary ones
        await cacheSearches([1000], true);

        // When Many more ordinary searches run, one of them the same query opened without its search key
        await cacheSearches([...range(1, MAX + 1), 1000]);

        // Then The pinned one survives and the cap still holds MAX ordinary searches
        const hashes = await getSnapshotHashes();
        expect(hashes).toContain(1000);
        expect(hashes).toHaveLength(MAX + 1);
    });

    it('keeps the query the Search page shows when its rows run more searches than the cap', async () => {
        // Given The page shows a query
        await writeSnapshot(500);
        await trackSearchPageSnapshotAccess(500, false);

        // When More groups are expanded than the cap allows, each running its own search
        await cacheSearches(range(1, MAX + 1));

        // Then The visible query's snapshot is not removed from under it
        expect(await getSnapshotHashes()).toContain(500);
    });

    it('drops snapshots cached before their use was tracked, once', async () => {
        // Given Snapshots left by an older version, with no access records
        await Promise.all(range(1, MAX + 10).map(writeSnapshot));

        // When The migration runs
        await ClearUntrackedSearchSnapshots();

        // Then They're gone, since they could never be evicted otherwise
        expect(await getSnapshotHashes()).toEqual([]);

        // When A tracked search is cached and the migration runs again on the next launch
        await cacheSearches([1]);
        await ClearUntrackedSearchSnapshots();

        // Then The tracked snapshot stays
        expect(await getSnapshotHashes()).toEqual([1]);
    });
});
