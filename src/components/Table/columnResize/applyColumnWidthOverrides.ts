/** Merges stored drag widths into a table's resolved column widths, and decides which column edges can be dragged. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {OverridableColumn} from './resolveOverriddenColumnWidths';
import type {ResizableColumn} from './types';

import {getColumnWidthValue} from './columnWidthExpressions';
import resolveOverriddenColumnWidths from './resolveOverriddenColumnWidths';

/** What resizing needs to know about a column, whatever lays the columns out. */
type ColumnWidthOverrideColumn = OverridableColumn;

type ApplyColumnWidthOverridesParams = {
    /** Every column, in render order. */
    columns: ColumnWidthOverrideColumn[];

    /** Widths before stored overrides are applied. */
    baseColumnWidths: Record<string, number>;

    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Column absorbing the row's leftover width, if any. It never pays a share of a resize. */
    growableColumnKey: string | undefined;
};

type AppliedColumnWidthOverrides = {
    /** Widths after stored overrides, which drags start from. */
    columnWidths: Record<string, number>;

    /** Each column's custom property CSS value with `columnWidths` as the fallback, in render order. */
    columnWidthValues: string[];

    /** Columns whose right edge the user can drag, in render order. */
    resizableColumns: ResizableColumn[];
};

/** Layout-agnostic, so it serves grid tracks and flex basis alike. */
function applyColumnWidthOverrides({columns, baseColumnWidths, columnWidthOverrides, growableColumnKey}: ApplyColumnWidthOverridesParams): AppliedColumnWidthOverrides {
    const {columnWidths, payingColumnsByIndex} = resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides, growableColumnKey});

    const columnWidthValues = columns.map((column) => getColumnWidthValue(column.key, columnWidths[column.key] ?? 0));
    const resizableColumns: ResizableColumn[] = [];

    for (const [index, column] of columns.entries()) {
        // Only headed, content-sized columns drag. Columns with a declared width, like a switch, status or count, hold fixed-size content.
        if (!column.label || column.hasDeclaredWidth) {
            continue;
        }

        resizableColumns.push({columnKey: column.key, absorbers: payingColumnsByIndex.at(index) ?? []});
    }

    return {columnWidths, columnWidthValues, resizableColumns};
}

export default applyColumnWidthOverrides;
export type {ColumnWidthOverrideColumn};
