/* eslint-disable @typescript-eslint/no-deprecated -- exercising the migration means writing SEARCH_QUERY_BY_HASH */
import MoveSearchQueryByHashToSnapshots from '@libs/migrations/MoveSearchQueryByHashToSnapshots';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CACHED_HASH = 111;
const TAGGED_HASH = 222;
const EVICTED_HASH = 333;

/** Only the snapshot's search metadata matters to the migration. */
function seedSnapshot(hash: number, inputQuery?: string) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`, {search: {hash, offset: 0, ...(inputQuery && {inputQuery})}, data: {}});
}

describe('MoveSearchQueryByHashToSnapshots', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => Onyx.clear().then(waitForBatchedUpdates));

    it('copies legacy queries onto cached snapshots and removes the legacy key', async () => {
        // Given a snapshot cached by an older version, whose query only lives in the legacy map
        await seedSnapshot(CACHED_HASH);
        await Onyx.set(ONYXKEYS.SEARCH_QUERY_BY_HASH, {[CACHED_HASH]: 'type:expense from:1'});

        // When the migration runs
        await MoveSearchQueryByHashToSnapshots();
        await waitForBatchedUpdates();

        // Then the snapshot carries its query, so optimistic expenses keep reaching it, and the legacy key is gone
        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${CACHED_HASH}`);
        expect(snapshot?.search?.inputQuery).toBe('type:expense from:1');
        expect(await getOnyxValue(ONYXKEYS.SEARCH_QUERY_BY_HASH)).toBeUndefined();
    });

    it('keeps a query the snapshot already recorded and creates no snapshot for evicted hashes', async () => {
        // Given one snapshot that already recorded its query, and a legacy entry whose snapshot was evicted
        await seedSnapshot(TAGGED_HASH, 'type:expense from:2');
        await Onyx.set(ONYXKEYS.SEARCH_QUERY_BY_HASH, {[TAGGED_HASH]: 'type:expense stale', [EVICTED_HASH]: 'type:expense from:3'});

        // When the migration runs
        await MoveSearchQueryByHashToSnapshots();
        await waitForBatchedUpdates();

        // Then the newer recorded query wins, and no partial snapshot is created for the evicted hash
        const taggedSnapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${TAGGED_HASH}`);
        expect(taggedSnapshot?.search?.inputQuery).toBe('type:expense from:2');
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${EVICTED_HASH}`)).toBeUndefined();
        expect(await getOnyxValue(ONYXKEYS.SEARCH_QUERY_BY_HASH)).toBeUndefined();
    });

    it('writes nothing when the legacy key is absent', async () => {
        // Given a snapshot and no legacy map, as on a fresh install
        await seedSnapshot(CACHED_HASH);

        // When the migration runs
        await MoveSearchQueryByHashToSnapshots();
        await waitForBatchedUpdates();

        // Then the snapshot is left as it was
        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${CACHED_HASH}`);
        expect(snapshot?.search?.inputQuery).toBeUndefined();
    });
});
