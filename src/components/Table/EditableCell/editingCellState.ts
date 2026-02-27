/**
 * Tracks how many inline editable cells are currently open.

 * Plain module state rather than React state because this is only read inside event handlers.
 */
let editingCellCount = 0;

function incrementEditingCellCount() {
    editingCellCount++;
}

function decrementEditingCellCount() {
    editingCellCount--;
}

function getIsEditingCell() {
    return editingCellCount > 0;
}

export {incrementEditingCellCount, decrementEditingCellCount, getIsEditingCell};
