/** Turns pointer travel into a column width, kept within the drag bounds. */
import CONST from '@src/CONST';

const {MIN_WIDTH, MAX_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

function clampColumnWidth(width: number, minWidth: number = MIN_WIDTH): number {
    return Math.min(Math.max(Math.round(width), minWidth), MAX_WIDTH);
}

/** The width a drag puts the column at: its start width plus the pointer's travel, within the drag bounds. */
function getDraggedColumnWidth(startWidth: number, startClientX: number, clientX: number, minWidth: number = MIN_WIDTH): number {
    return clampColumnWidth(startWidth + (clientX - startClientX), minWidth);
}

export default getDraggedColumnWidth;
