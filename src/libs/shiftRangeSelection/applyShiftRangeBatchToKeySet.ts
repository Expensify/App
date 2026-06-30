import type {ShiftRangeBatch} from './types';

/** Apply a shift-range batch to a list of primitive keys, preserving prev order and deduping. */
function applyShiftRangeBatchToKeySet<TItem, TKey extends string | number>(
    batch: ShiftRangeBatch<TItem>,
    prevKeys: readonly TKey[],
    getKey: (item: TItem) => TKey | null | undefined,
    isSelectable?: (item: TItem) => boolean,
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
    const addOrdered: TKey[] = [];
    const addSet = new Set<TKey>();
    for (const item of batch.toSelect) {
        const key = getKey(item);
        if (key == null || addSet.has(key)) {
            continue;
        }
        if (isSelectable ? !isSelectable(item) : isBlocked(item)) {
            continue;
        }
        addSet.add(key);
        addOrdered.push(key);
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
    for (const key of addOrdered) {
        if (!seen.has(key)) {
            seen.add(key);
            next.push(key);
        }
    }
    return next;
}

function isBlocked(item: unknown): boolean {
    if (typeof item !== 'object' || item === null) {
        return false;
    }
    return ('isDisabled' in item && !!item.isDisabled) || ('isDisabledCheckbox' in item && !!item.isDisabledCheckbox);
}

export default applyShiftRangeBatchToKeySet;
