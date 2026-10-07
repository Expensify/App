/** Turns pointer travel into a column width, kept within the drag bounds. */
import CONST from '@src/CONST';

const {MIN_WIDTH, MAX_WIDTH, DRAG_SLOP} = CONST.TABLES.COLUMN_RESIZE;

function clampColumnWidth(width: number, minWidth: number = MIN_WIDTH): number {
    return Math.min(Math.max(Math.round(width), minWidth), MAX_WIDTH);
}

/** Whether the pointer travelled far enough to mean a drag. A mouse click rarely lands on the exact pixel it started from. */
function hasPointerPassedDragSlop(startClientX: number, clientX: number): boolean {
    return Math.abs(clientX - startClientX) > DRAG_SLOP;
}

/** The width a drag puts the column at: its start width plus the pointer's travel, within the drag bounds. */
function getDraggedColumnWidth(startWidth: number, startClientX: number, clientX: number, minWidth: number = MIN_WIDTH): number {
    return clampColumnWidth(startWidth + (clientX - startClientX), minWidth);
}

export default getDraggedColumnWidth;
export {clampColumnWidth, hasPointerPassedDragSlop};
