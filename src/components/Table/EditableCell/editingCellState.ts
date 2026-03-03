/**
 * Tracks whether an inline editable cell is currently open.
 *
 * Plain module state rather than React state because this is only read inside event handlers.
 */
let isEditingCell = false;

function setIsEditingCell(value: boolean) {
    isEditingCell = value;
}

function getIsEditingCell() {
    return isEditingCell;
}

export {setIsEditingCell, getIsEditingCell};
