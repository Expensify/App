import type {ShiftRangeBatch} from './types';

/**
 * Applies a shift-range batch to a list toggled one item at a time (e.g. a checkbox): flips only the rows whose state must
 * change, deselecting before selecting. The toggle must use a functional setState so the flips compose into one selection.
 */
function applyShiftRangeByToggle<TItem>(batch: ShiftRangeBatch<TItem>, isSelected: (item: TItem) => boolean, toggle: (item: TItem) => void): void {
    for (const item of batch.toDeselect) {
        if (isSelected(item)) {
            toggle(item);
        }
    }
    for (const item of batch.toSelect) {
        if (!isSelected(item)) {
            toggle(item);
        }
    }
}

export default applyShiftRangeByToggle;
