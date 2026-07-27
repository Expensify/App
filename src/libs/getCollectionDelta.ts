import type {OnyxCollection} from 'react-native-onyx';

/**
 * Computes the subset of collection members that changed between two snapshots.
 * Relies on Onyx structural sharing: unchanged members keep the same
 * reference, so this is a cheap O(members) reference-equality scan.
 *
 * A missing (`undefined`) snapshot is treated as an empty collection, so members present on only one
 * side count as added/removed. Returns `undefined` only when nothing changed (the two snapshots are
 * reference-equal or no member differs).
 */
function getCollectionDelta<TValue>(current: OnyxCollection<TValue>, previous: OnyxCollection<TValue>): OnyxCollection<TValue> | undefined {
    if (current === previous) {
        return undefined;
    }

    const delta: OnyxCollection<TValue> | undefined = {};
    let hasChanges = false;

    // Added or changed members (reference differs from the previous snapshot).
    if (current) {
        for (const key of Object.keys(current)) {
            if (current[key] === previous?.[key]) {
                continue;
            }
            delta[key] = current[key];
            hasChanges = true;
        }
    }

    // Removed members (present in the previous snapshot, gone from the current one).
    if (previous) {
        for (const key of Object.keys(previous)) {
            if (current && key in current) {
                continue;
            }
            delta[key] = undefined;
            hasChanges = true;
        }
    }

    return hasChanges ? delta : undefined;
}

export default getCollectionDelta;
