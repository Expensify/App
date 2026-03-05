import CONST from '@src/CONST';

/**
 * Reorders a list of keys by moving the initially selected keys to the top while keeping
 * the relative ordering from the original list for both selected and remaining items.
 */
function moveInitialSelectionToTopByKey(keys: string[], initialSelectedKeys: string[]): string[] {
    if (initialSelectedKeys.length === 0 || keys.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
        return keys;
    }

    const initialSelectionSet = new Set(initialSelectedKeys);
    const selected: string[] = [];
    const remaining: string[] = [];

    for (const key of keys) {
        if (initialSelectionSet.has(key)) {
            selected.push(key);
            continue;
        }
        remaining.push(key);
    }

    return [...selected, ...remaining];
}

/**
 * Reorders items that contain a `value` field by moving the initially selected values to the top.
 * Preserves the original ordering within the selected and remaining groups.
 */
function moveInitialSelectionToTopByValue<T extends {value: string}>(items: T[], initialSelectedValues: string[]): T[] {
    if (initialSelectedValues.length === 0 || items.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
        return items;
    }

    const orderedValues = moveInitialSelectionToTopByKey(
        items.map((item) => item.value),
        initialSelectedValues,
    );

    const itemsByValue = new Map<string, T[]>();
    for (const item of items) {
        const bucket = itemsByValue.get(item.value) ?? [];
        bucket.push(item);
        itemsByValue.set(item.value, bucket);
    }

    const reordered: T[] = [];
    for (const value of orderedValues) {
        const bucket = itemsByValue.get(value);
        if (!bucket || bucket.length === 0) {
            continue;
        }
        const nextItem = bucket.shift();
        if (nextItem) {
            reordered.push(nextItem);
        }
    }

    return reordered;
}

export {moveInitialSelectionToTopByKey, moveInitialSelectionToTopByValue};
