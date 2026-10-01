import type {ColumnWidthOverrides, ResizableColumn} from './types';

import {getColumnWidthValue} from './columnWidthExpressions';

/** What resizing needs to know about a column, whatever lays the columns out. */
type ColumnWidthOverrideColumn = {
    /** The column's key, which is what a stored width is filed under. */
    key: string;

    /** The column's heading. Headless columns hold fixed-size content (icon, checkbox, arrow), so they get no edge. */
    label: string;

    /** Whether the column declared a width of its own, which takes it out of resizing. */
    hasDeclaredWidth: boolean;
};

type ApplyColumnWidthOverridesParams = {
    /** Every column, in the order the header and the rows render them. */
    columns: ColumnWidthOverrideColumn[];

    /** What each column is laid out at before any width the user dragged is applied. */
    baseColumnWidths: Record<string, number>;

    /** Widths the user already dragged this table's columns to. */
    columnWidthOverrides: ColumnWidthOverrides | undefined;
};

type AppliedColumnWidthOverrides = {
    /** What each column is laid out at once every stored width has been applied, which is also where a drag starts from. */
    columnWidths: Record<string, number>;

    /** Each column's width as a CSS value reading its custom property, falling back to `columnWidths`, in render order. */
    columnWidthValues: string[];

    /** The columns whose right edge the user can drag, in render order. */
    resizableColumns: ResizableColumn[];
};

/**
 * Reads a stored width as whole px. Not clamped to drag bounds: stored widths can also be frozen resolved widths,
 * which may legitimately fall outside them.
 */
function getStoredColumnWidth(width: number): number {
    return Math.max(Math.round(width), 0);
}

/**
 * Applies the user's stored widths to a table's columns and works out which edges drag. Knows nothing of how the
 * columns are laid out, so a grid turns `columnWidthValues` into tracks and a flex row into each cell's basis.
 */
function applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides}: ApplyColumnWidthOverridesParams): AppliedColumnWidthOverrides {
    const columnWidths = {...baseColumnWidths};
    const resizableColumns: ResizableColumn[] = [];

    for (const column of columns) {
        // Only headed, content-sized columns get an edge, including the last: widening it scrolls, narrowing it hands
        // room to the growable column. Columns that declared a width (switch, status, count) hold fixed-size content.
        if (!column.label || column.hasDeclaredWidth) {
            continue;
        }

        const overriddenWidth = columnWidthOverrides?.[column.key];

        if (overriddenWidth !== undefined) {
            columnWidths[column.key] = getStoredColumnWidth(overriddenWidth);
        }

        resizableColumns.push({columnKey: column.key});
    }

    const columnWidthValues = columns.map((column) => getColumnWidthValue(column.key, columnWidths[column.key] ?? 0));

    return {columnWidths, columnWidthValues, resizableColumns};
}

export default applyColumnWidthOverrides;
export type {ColumnWidthOverrideColumn};
