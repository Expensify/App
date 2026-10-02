import CONST from '@src/CONST';

/** Whether a list of `itemCount` items is long enough for the initial selection to be pinned to the top. */
function shouldMoveInitialSelectionToTop(itemCount: number): boolean {
    return itemCount >= CONST.STANDARD_LIST_ITEM_LIMIT;
}
/**
 * Moves the pre-selected items to the top of the list, keeping the rest in their original order.
 * No-ops for short lists (below the item-limit threshold) or when nothing is pre-selected.
 *
 * By default items are matched on their `value`. Pass `getKey` to match on a different field
 * (e.g. `keyForList` for lists that don't key on `value`).
 */
function moveInitialSelectionToTop<T extends {value?: unknown}>(
    items: T[],
    initialSelectedValues: string[],
    getKey: (item: T) => number | string | undefined = (item) => (typeof item.value === 'string' || typeof item.value === 'number' ? item.value : undefined),
): T[] {
    if (initialSelectedValues.length === 0 || !shouldMoveInitialSelectionToTop(items.length)) {
        return items;
    }

    const selectedValues = new Set(initialSelectedValues);
    const selected: T[] = [];
    const remaining: T[] = [];

    for (const item of items) {
        const key = getKey(item);
        if (key !== undefined && selectedValues.has(String(key))) {
            selected.push(item);
            continue;
        }

        remaining.push(item);
    }

    return [...selected, ...remaining];
}

export default moveInitialSelectionToTop;
export {shouldMoveInitialSelectionToTop};
