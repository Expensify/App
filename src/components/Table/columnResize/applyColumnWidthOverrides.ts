/** Merges stored drag widths into a table's resolved column widths, and decides which column edges can be dragged. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import {getColumnWidthValue} from './columnWidthExpressions';

/** What resizing needs to know about a column, whatever lays the columns out. */
type ColumnWidthOverrideColumn = {
    /** Key a stored width is filed under. */
    key: string;

    /** Headless columns hold fixed-size content like an icon, checkbox or arrow, so they get no edge. */
    label: string;

    /** Columns with a declared width aren't resizable. */
    hasDeclaredWidth: boolean;
};

type ApplyColumnWidthOverridesParams = {
    /** Every column, in render order. */
    columns: ColumnWidthOverrideColumn[];

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

/** Whole px, deliberately not clamped: stored widths may legitimately fall outside drag bounds. */
function getStoredColumnWidth(width: number): number {
    return Math.max(Math.round(width), 0);
}

/** Layout-agnostic, so it serves grid tracks and flex basis alike. */
function applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides}: ApplyColumnWidthOverridesParams): AppliedColumnWidthOverrides {
    const columnWidths = {...baseColumnWidths};
    const resizableColumnKeys: string[] = [];

    for (const column of columns) {
        // Only headed, content-sized columns drag. Columns with a declared width, like a switch, status or count, hold fixed-size content.
        if (!column.label || column.hasDeclaredWidth) {
            continue;
        }

        const overriddenWidth = columnWidthOverrides?.[column.key];

        if (overriddenWidth !== undefined) {
            columnWidths[column.key] = getStoredColumnWidth(overriddenWidth);
        }

        resizableColumnKeys.push(column.key);
    }

    const columnWidthValues = columns.map((column) => getColumnWidthValue(column.key, columnWidths[column.key] ?? 0));

    return {columnWidths, columnWidthValues, resizableColumnKeys};
}

export default applyColumnWidthOverrides;
export type {ColumnWidthOverrideColumn};
