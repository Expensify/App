/**
 * Tracks whether an inline editable cell is currently open and which cell has keyboard focus.
 *
 * Plain module state rather than React state because this is only read inside event handlers.
 */
let isEditingCell = false;
let focusedCellId: string | null = null;

function setIsEditingCell(value: boolean) {
    isEditingCell = value;
}

function getIsEditingCell() {
    return isEditingCell;
}

function setFocusedCellId(cellId: string | null) {
    focusedCellId = cellId;
}

function getFocusedCellId() {
    return focusedCellId;
}

export {setIsEditingCell, getIsEditingCell, setFocusedCellId, getFocusedCellId};
