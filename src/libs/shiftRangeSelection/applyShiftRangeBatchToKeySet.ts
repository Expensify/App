import type {ShiftRangeBatch} from './types';

/**
 * Apply a shift-range batch to a list of primitive keys, preserving prev order and deduping. The batch is already clean — the range
 * hook excludes header/disabled rows via `isHeaderItem`/`isDisabledItem` when it builds it — so this is the single source of truth for
 * selectability; it does not re-filter.
 */
function applyShiftRangeBatchToKeySet<TItem, TKey extends string | number>(
    batch: ShiftRangeBatch<TItem>,
    prevKeys: readonly TKey[],
    getKey: (item: TItem) => TKey | null | undefined,
): TKey[] {
    if (!batch.toSelect.length && !batch.toDeselect.length) {
        return [...prevKeys];
    }
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
