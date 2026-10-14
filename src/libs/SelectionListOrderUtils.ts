import CONST from '@src/CONST';

/** Whether a list of `itemCount` items is long enough for the initial selection to be pinned to the top. */
function shouldMoveInitialSelectionToTop(itemCount: number): boolean {
    return itemCount >= CONST.STANDARD_LIST_ITEM_LIMIT;
}

function moveInitialSelectionToTop<T extends {value?: number | string}>(items: T[], initialSelectedValues: string[]): T[] {
    if (initialSelectedValues.length === 0 || !shouldMoveInitialSelectionToTop(items.length)) {
        return items;
    }

    const selectedValues = new Set(initialSelectedValues);
    const selected: T[] = [];
    const remaining: T[] = [];

    for (const item of items) {
        if (item.value !== undefined && selectedValues.has(String(item.value))) {
            selected.push(item);
            continue;
        }

        remaining.push(item);
    }

    return [...selected, ...remaining];
}

export default moveInitialSelectionToTop;
export {shouldMoveInitialSelectionToTop};
