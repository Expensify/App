import CONST from '@src/CONST';

function moveInitialSelectionToTopByKey(keys: string[], initialSelectedKeys: string[]): string[] {
    if (initialSelectedKeys.length === 0 || keys.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
        return keys;
    }

    const selectedKeys = new Set(initialSelectedKeys);
    const selected: string[] = [];
    const remaining: string[] = [];

    for (const key of keys) {
        if (selectedKeys.has(key)) {
            selected.push(key);
            continue;
        }

        remaining.push(key);
    }

    return [...selected, ...remaining];
}

function moveInitialSelectionToTopByValue<T extends {value: string}>(items: T[], initialSelectedValues: string[]): T[] {
    if (initialSelectedValues.length === 0 || items.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
        return items;
    }

    const selectedValues = new Set(initialSelectedValues);
    const selected: T[] = [];
    const remaining: T[] = [];

    for (const item of items) {
        if (selectedValues.has(item.value)) {
            selected.push(item);
            continue;
        }

        remaining.push(item);
    }

    return [...selected, ...remaining];
}

export {moveInitialSelectionToTopByKey, moveInitialSelectionToTopByValue};
