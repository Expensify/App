import type ONYXKEYS from '@src/ONYXKEYS';

// A literal rather than ONYXKEYS.COLLECTION.SNAPSHOT: the no-onyx-get-snapshot-key lint rule loads this file under plain node, where
// neither the @src alias nor extension-less imports resolve. The satisfies clause pins it to that key.
const SNAPSHOT_COLLECTION_KEY = 'snapshot_' satisfies (typeof ONYXKEYS)['COLLECTION']['SNAPSHOT'];

/** True when `useOnyx` would redirect `key` to a Search snapshot. A `snapshot_` key itself never counts, whatever `snapshotKeys` holds. */
function isSnapshotCompatibleKey(key: string, snapshotKeys: readonly string[]): boolean {
    return !key.startsWith(SNAPSHOT_COLLECTION_KEY) && snapshotKeys.some((snapshotKey) => key.startsWith(snapshotKey));
}

export default isSnapshotCompatibleKey;
