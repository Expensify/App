import {search} from '@libs/actions/Search';
import {showSearchSnapshots, trackSearchSnapshotAccess} from '@libs/actions/SearchSnapshotCache';
import * as API from '@libs/API';
import ClearUntrackedSearchSnapshots from '@libs/migrations/ClearUntrackedSearchSnapshots';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const MAX = CONST.SEARCH.MAX_CACHED_SNAPSHOTS;
const MAX_PINNED = CONST.SEARCH.MAX_CACHED_PINNED_SNAPSHOTS;

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

    it('keeps the snapshots a view shows, even after the user switches to another tab', async () => {
        // Given Spend shows a query and a dashboard shows more snapshots than the cap, both staying mounted in frozen tabs
        await Promise.all([500, ...range(2000, MAX + 5)].map(writeSnapshot));
        const hideSpend = showSearchSnapshots([500]);
        const hideDashboard = showSearchSnapshots(range(2000, MAX + 5));

        // When Many other searches run elsewhere
        await cacheSearches(range(1, MAX + 5));

        // Then Nothing either view shows is removed from under it, while everything else stays capped
        let hashes = await getSnapshotHashes();
        expect(hashes).toEqual(expect.arrayContaining([500, ...range(2000, MAX + 5)]));
        expect(hashes.filter((hash) => hash < 500)).toHaveLength(MAX);

        // When Both views move on and another search runs
        hideSpend();
        hideDashboard();
        await cacheSearches([MAX + 10]);

        // Then Their snapshots are evictable again, so the cap holds
        hashes = await getSnapshotHashes();
        expect(hashes).toContain(MAX + 10);
        expect(hashes).toHaveLength(MAX);
    });

    it('keeps a query shown with nothing cached out of the cache budget', async () => {
        // Given A full cache
        await cacheSearches(range(1, MAX));

        // When Views show queries that were never cached, e.g. offline, so no request writes their snapshots
        const hide = showSearchSnapshots([9001, 9002]);
        hide();
        await cacheSearches([MAX + 1]);

        // Then They take no cache slot, so only the oldest real snapshot makes room for the new one
        expect(await getSnapshotHashes()).toEqual(range(2, MAX));
    });

    it('pins a saved search that is shown before its snapshot is cached', async () => {
        // Given A saved search opened with nothing cached, so showing it has no snapshot to pin yet
        const hide = showSearchSnapshots([7000], true);

        // When Its request writes the snapshot and records the access, as search() does, and the user moves on
        await writeSnapshot(7000);
        await trackSearchSnapshotAccess([7000]);
        hide();
        await cacheSearches(range(1, MAX + 1));

        // Then It was recorded as pinned, so ordinary searches don't evict it
        expect(await getSnapshotHashes()).toContain(7000);
    });

    it('tracks a snapshot a failed request recreates after it was evicted mid-flight', async () => {
        // Given A search whose request is still pending
        const queryJSON = buildSearchQueryJSON('type:expense status:all');
        if (!queryJSON) {
            throw new Error('Invalid query');
        }
        let rejectRequest: (error: Error) => void = () => {};
        jest.spyOn(API, 'makeRequestWithSideEffects').mockImplementation(
            () =>
                new Promise((resolve, reject) => {
                    rejectRequest = reject;
                }),
        );
        search({queryJSON, searchKey: undefined, offset: 0, isLoading: false, skipWaitForWrites: true});
        await waitForBatchedUpdates();

        // When Newer searches evict its snapshot, then the request fails at the network level and writes its error state
        await cacheSearches(range(1, MAX + 1));
        rejectRequest(new Error('Network request failed'));
        await waitForBatchedUpdates();
        await trackSearchSnapshotAccess([]);

        // Then The recreated snapshot is tracked again, so a later eviction can still remove it
        const access = await new Promise<Record<string, unknown> | undefined>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.SEARCH_SNAPSHOT_ACCESS,
                callback: (value) => {
                    connection.unsubscribe();
                    resolve(value);
                },
            });
        });
        expect(await getSnapshotHashes()).toContain(queryJSON.hash);
        expect(access).toHaveProperty(String(queryJSON.hash));
    });

    it('caps pinned searches separately, so pins of deleted or edited saved searches age out', async () => {
        // Given More saved and suggested searches opened than their cap allows, e.g. because some saved searches were deleted
        await cacheSearches(range(1000, MAX_PINNED + 2), true);

        // When Many ordinary searches run as well
        await cacheSearches(range(1, MAX + 5));

        // Then The least recently used pins are evicted, and ordinary searches never push out a pinned one
        const hashes = await getSnapshotHashes();
        expect(hashes.filter((hash) => hash >= 1000)).toEqual(range(1002, MAX_PINNED));
        expect(hashes.filter((hash) => hash < 1000)).toHaveLength(MAX);
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
