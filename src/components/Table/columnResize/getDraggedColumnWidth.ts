/** Turns pointer travel into a column width, kept above the drag floor. */
import CONST from '@src/CONST';

/** The width a drag puts the column at: its start width plus the pointer's travel, no narrower than the floor. */
function getDraggedColumnWidth(startWidth: number, startClientX: number, clientX: number, minWidth: number = CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH): number {
    return Math.max(Math.round(startWidth + (clientX - startClientX)), minWidth);
}

export default getDraggedColumnWidth;
