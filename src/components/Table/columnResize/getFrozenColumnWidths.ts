/** Repaints a saved layout, with the columns the user never dragged absorbing room that changed since the save. */
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import type {ResizableColumn} from './resolveDraggedColumnWidths';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';
import getColumnsWidthSum from './getColumnsWidthSum';
import {getAbsorbedDelta, getColumnAbsorbers} from './resolveDraggedColumnWidths';

type GetFrozenColumnWidthsParams = {
    /** Every column, in render order. A column added since the save starts at its content width. */
    columns: ResizableColumn[];

    storedTableColumnWidths: StoredTableColumnWidths;

    /** Measured like the saved one, so they can be compared. */
    availableColumnsWidth: number;
};

/**
 * Room gained or lost since the save, from the table width or from added and hidden columns, first offsets the saved
 * overflow or short row, like a drag does. The rest is split equally among the auto-sized columns. Widths are recomputed
 * from the save every time, so resizing the window back restores them exactly.
 */
function getFrozenColumnWidths({
    columns,
    storedTableColumnWidths: {availableColumnsWidth: savedAvailableColumnsWidth, columnWidths: savedColumnWidths, resizedColumnKeys},
    availableColumnsWidth,
}: GetFrozenColumnWidthsParams): Record<string, number> {
    const baseColumnWidths: Record<string, number> = {};

    for (const column of columns) {
        baseColumnWidths[column.key] = column.declaredWidth ?? savedColumnWidths[column.key] ?? Math.min(column.contentWidth, column.maxWidth);
    }

    // Every saved column, hidden ones included, so a hidden column's width counts as freed room.
    const savedColumnsWidth = Object.values(savedColumnWidths).reduce((total, width) => total + width, 0);
    const extraRoom = availableColumnsWidth - savedAvailableColumnsWidth + savedColumnsWidth - getColumnsWidthSum(columns, baseColumnWidths);
    const absorbers = getColumnAbsorbers(
        columns.filter((column) => savedColumnWidths[column.key] !== undefined),
        resizedColumnKeys,
    );

    // Negated because a positive delta shrinks absorbers.
    const absorbedDelta = getAbsorbedDelta(-extraRoom, savedColumnsWidth - savedAvailableColumnsWidth);

    return {...baseColumnWidths, ...getAbsorbedColumnWidths(absorbers, baseColumnWidths, absorbedDelta)};
}

export default getFrozenColumnWidths;
