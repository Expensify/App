import CONST from '@src/CONST';

function moveInitialSelectionToTop<T>(items: T[], initialSelectedKeys: string[], getKey: (item: T) => string): T[] {
    if (initialSelectedKeys.length === 0 || items.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
        return items;
    }

    const selectedKeys = new Set(initialSelectedKeys);
    const selected: T[] = [];
    const remaining: T[] = [];

    for (const item of items) {
        if (selectedKeys.has(getKey(item))) {
            selected.push(item);
            continue;
        }

        remaining.push(item);
    }

    return [...selected, ...remaining];
}

export default moveInitialSelectionToTop;
