/** Merges stored drag widths into a table's resolved column widths, and decides which column edges can be dragged. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {OverridableColumn} from './resolveOverriddenColumnWidths';

import {getColumnWidthValue} from './columnWidthExpressions';
import resolveOverriddenColumnWidths from './resolveOverriddenColumnWidths';

type ApplyColumnWidthOverridesParams = {
    /** Every column, in render order. */
    columns: OverridableColumn[];

    /** Widths before stored overrides are applied. */
    baseColumnWidths: Record<string, number>;

    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Width the row has for its columns, which absorbers keep it at. */
    availableColumnsWidth: number;
};

type AppliedColumnWidthOverrides = {
    /** Widths after stored overrides, which drags start from. */
    columnWidths: Record<string, number>;

    /** Each column's custom property CSS value with `columnWidths` as the fallback, in render order. */
    columnWidthValues: string[];

    /** Keys of the columns whose right edge the user can drag, in render order. */
    resizableColumnKeys: string[];
};

/** Layout-agnostic, so it serves grid tracks and flex basis alike. */
function applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides, availableColumnsWidth}: ApplyColumnWidthOverridesParams): AppliedColumnWidthOverrides {
    const columnWidths = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides, availableColumnsWidth});
    const columnWidthValues = columns.map((column) => getColumnWidthValue(column.key, columnWidths[column.key] ?? 0));

    // Only headed, content-sized columns drag. Columns with a declared width, like a switch, status or count, hold fixed-size content.
    const resizableColumnKeys = columns.filter((column) => !!column.label && !column.hasDeclaredWidth).map((column) => column.key);

    return {columnWidths, columnWidthValues, resizableColumnKeys};
}

export default applyColumnWidthOverrides;
