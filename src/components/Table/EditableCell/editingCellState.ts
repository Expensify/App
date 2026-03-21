/**
 * Tracks whether an inline editable cell is currently open and which cell has keyboard focus.
 *
 * Plain module state rather than React state because this is only read inside event handlers.
 */
let isEditingCell = false;
let wasRecentlyEditingCell = false;
let focusedCellId: string | null = null;

function setIsEditingCell(value: boolean) {
    isEditingCell = value;

    if (!value) {
        wasRecentlyEditingCell = true;

        // Clear the flag after one frame (after focus effects have run)
        requestAnimationFrame(() => {
            wasRecentlyEditingCell = false;
        });
    }
}

function getIsEditingCell() {
    return isEditingCell;
}

function getWasRecentlyEditingCell() {
    return wasRecentlyEditingCell;
}

function setFocusedCellId(cellId: string | null) {
    focusedCellId = cellId;
}

function getFocusedCellId() {
    return focusedCellId;
}

export {setIsEditingCell, getIsEditingCell, getWasRecentlyEditingCell, setFocusedCellId, getFocusedCellId};
