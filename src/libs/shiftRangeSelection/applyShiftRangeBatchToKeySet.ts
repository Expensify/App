import type {ShiftRangeBatch} from './types';

/**
 * Apply a shift-range batch to a list of primitive keys, preserving prev order and deduping. No filtering here — the range hook
 * already excludes header/disabled rows when it builds the batch, so it stays the single source of truth on what is selectable.
 */
function applyShiftRangeBatchToKeySet<TItem, TKey extends string | number>(
    batch: ShiftRangeBatch<TItem>,
    prevKeys: readonly TKey[],
    getKey: (item: TItem) => TKey | null | undefined,
): TKey[] {
    const removeSet = new Set<TKey>();
    for (const item of batch.toDeselect) {
        const key = getKey(item);
        if (key != null) {
            removeSet.add(key);
        }
    }
    const next: TKey[] = [];
    const seen = new Set<TKey>();
    for (const key of prevKeys) {
        if (removeSet.has(key) || seen.has(key)) {
            continue;
        }
        seen.add(key);
        next.push(key);
    }
    for (const item of batch.toSelect) {
        const key = getKey(item);
        if (key == null || seen.has(key)) {
            continue;
        }
        seen.add(key);
        next.push(key);
    }
    return next;
}

export default applyShiftRangeBatchToKeySet;
