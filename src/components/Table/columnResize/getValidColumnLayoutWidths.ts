/** Decides whether a stored layout still describes the table, so a reload repaints it instead of reflowing. */
import type {ColumnLayout} from '@src/types/onyx/TableColumnWidths';

/**
 * A stored layout holds only while the one it was painted in does. A new table width, new or hidden columns, new
 * content, or a stored width that changed reflows the columns from scratch.
 */
function getValidColumnLayoutWidths(
    columnLayout: ColumnLayout | undefined,
    tableWidth: number,
    fitColumnWidths: Record<string, number>,
    storedColumnWidths: Map<string, number>,
): Record<string, number> | undefined {
    if (!columnLayout || columnLayout.tableWidth !== tableWidth) {
        return undefined;
    }

    const hasSameContent = Object.entries(fitColumnWidths).every(([columnKey, fitWidth]) => columnLayout.fitColumnWidths[columnKey] === fitWidth);
    // The dragged column was content-sized when the layout was stored and is user-sized since, so it counts as still there.
    const hasSameColumns = Object.keys(columnLayout.fitColumnWidths).every((columnKey) => fitColumnWidths[columnKey] !== undefined || storedColumnWidths.has(columnKey));
    const hasSameStoredWidths = [...storedColumnWidths].every(([columnKey, width]) => columnLayout.columnWidths[columnKey] === width);

    return hasSameContent && hasSameColumns && hasSameStoredWidths ? columnLayout.columnWidths : undefined;
}

export default getValidColumnLayoutWidths;
