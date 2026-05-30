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
 * Rebuilds a frozen pre-selection section by syncing each item's `isSelected` flag against the
 * current selection, leaving row positions untouched. Pair with `useFrozenPreSelection` to render
 * a stable top section whose checkmarks update on toggle without rows jumping.
 */
function buildFrozenSection<T extends {isSelected?: boolean}>(frozen: T[], isCurrentlySelected: (item: T) => boolean): T[] {
    return frozen.map((item) => ({...item, isSelected: isCurrentlySelected(item)}));
}

/**
 * Excludes items that already appear in the frozen pre-selection section so they don't render twice.
 */
function excludeFrozenItems<T>(items: T[], isFrozen: (item: T) => boolean): T[] {
    return items.filter((item) => !isFrozen(item));
}

export {buildFrozenSection, excludeFrozenItems};
export default moveInitialSelectionToTop;
