import CONST from '@src/CONST';

function moveInitialSelectionToTop<T extends {value?: number | string}>(items: T[], initialSelectedValues: string[]): T[] {
    if (initialSelectedValues.length === 0 || items.length < CONST.STANDARD_LIST_ITEM_LIMIT) {
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
