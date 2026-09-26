import CONST from '@src/CONST';

/**
 * Moves the pre-selected items to the top of the list, keeping the rest in their original order.
 * No-ops for short lists (below the item-limit threshold) or when nothing is pre-selected.
 *
 * By default items are matched on their `value`. Pass `getKey` to match on a different field
 * (e.g. `keyForList` for lists that don't key on `value`).
 */
function moveInitialSelectionToTop<T extends {value?: number | string}>(
    items: T[],
    initialSelectedValues: string[],
    getKey: (item: T) => number | string | undefined = (item) => item.value,
): T[] {
    if (initialSelectedValues.length === 0 || items.length < CONST.STANDARD_LIST_ITEM_LIMIT) {
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
