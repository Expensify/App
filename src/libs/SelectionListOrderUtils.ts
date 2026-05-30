import CONST from '@src/CONST';

function moveInitialSelectionToTop<T extends {value: string}>(items: T[], initialSelectedValues: string[]): T[] {
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

/**
 * Refreshes the `isSelected` flag on frozen rows without changing their order. Pair with
 * `useFrozenPreSelection` so selection indicators track the live selection while rows stay put.
 */
function buildFrozenSection<T extends {isSelected?: boolean}>(frozen: T[], isCurrentlySelected: (item: T) => boolean): T[] {
    return frozen.map((item) => ({...item, isSelected: isCurrentlySelected(item)}));
}

/** Drops items already shown in the frozen top section so they don't render twice. */
function excludeFrozenItems<T>(items: T[], isFrozen: (item: T) => boolean): T[] {
    return items.filter((item) => !isFrozen(item));
}

export {buildFrozenSection, excludeFrozenItems};
export default moveInitialSelectionToTop;
