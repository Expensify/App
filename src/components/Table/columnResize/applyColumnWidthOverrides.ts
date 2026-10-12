/** Merges stored drag widths into a table's resolved column widths, and decides which column edges can be dragged. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {ResizableColumn} from './resolveDraggedColumnWidths';

import {getColumnWidthValue} from './columnWidthExpressions';
import {isColumnResizable} from './resolveDraggedColumnWidths';

type ApplyColumnWidthOverridesParams = {
    /** Every column, in render order. */
    columns: ResizableColumn[];

    /** Widths before stored overrides are applied. */
    baseColumnWidths: Record<string, number>;

    columnWidthOverrides: ColumnWidthOverrides | undefined;
};

type AppliedColumnWidthOverrides = {
    /** Widths after stored overrides, which drags start from. */
    columnWidths: Record<string, number>;

    /** Each column's custom property CSS value with `columnWidths` as the fallback, in render order. */
    columnWidthValues: string[];

    /** Keys of the columns whose right edge the user can drag, in render order. */
    resizableColumnKeys: string[];
};

/**
 * Rounded to whole px, but not held to the minimum a drag allows. That minimum depends on the current layout, so a width
 * stored earlier can sit below it, and clamping would resize a column the user set.
 */
function getStoredColumnWidth(width: number): number {
    return Math.max(Math.round(width), 0);
}

/** Layout-agnostic, so it serves grid tracks and flex basis alike. */
function applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides}: ApplyColumnWidthOverridesParams): AppliedColumnWidthOverrides {
    const columnWidths = {...baseColumnWidths};
    const resizableColumns = columns.filter(isColumnResizable);

    for (const column of resizableColumns) {
        const overriddenWidth = columnWidthOverrides?.[column.key];

        if (overriddenWidth !== undefined) {
            columnWidths[column.key] = getStoredColumnWidth(overriddenWidth);
        }
    }

    const columnWidthValues = columns.map((column) => getColumnWidthValue(column.key, columnWidths[column.key] ?? 0));

    return {columnWidths, columnWidthValues, resizableColumnKeys: resizableColumns.map((column) => column.key)};
}

export default applyColumnWidthOverrides;
export {getStoredColumnWidth};
