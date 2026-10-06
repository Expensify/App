/** Applies stored drag widths to a table's columns, taking each difference out of the columns to its right. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {ColumnAbsorber} from './types';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';

/** What the resolver needs to know about a column to work out who pays for whom. */
type OverridableColumn = {
    /** Key a stored width is filed under. */
    key: string;

    /** Headless columns hold fixed-size content like an icon, checkbox or arrow, so they never pay. */
    label: string;

    /** Columns with a declared width don't share the row. */
    hasDeclaredWidth: boolean;

    /** Width its content and header need, which paying for another column never squeezes it below. `undefined` when unknown. */
    fitWidth: number | undefined;
};

type ResolveOverriddenColumnWidthsParams = {
    /** Every column, in render order. */
    columns: OverridableColumn[];

    /** Widths before stored overrides are applied. */
    baseColumnWidths: Record<string, number>;

    columnWidthOverrides: ColumnWidthOverrides | undefined;
};

type ResolvedOverriddenColumnWidths = {
    /** Widths after every stored override and its payers are applied. */
    columnWidths: Record<string, number>;

    /** The columns paying for the column at the same index, in render order. */
    payingColumnsByIndex: ColumnAbsorber[][];
};

/** Whole px, deliberately not clamped: stored widths may legitimately fall outside drag bounds. */
function getStoredColumnWidth(width: number): number {
    return Math.max(Math.round(width), 0);
}

/**
 * Applies stored widths in render order, each paid by the later columns still sharing the row (not headless, fixed or
 * user-sized) down to their fit width. Uses the same split as the drag, so columns don't jump on release.
 */
function resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides}: ResolveOverriddenColumnWidthsParams): ResolvedOverriddenColumnWidths {
    const canColumnPay = columns.map((column) => !!column.label && !column.hasDeclaredWidth && columnWidthOverrides?.[column.key] === undefined);

    const payingColumnsByIndex = columns.map((column, index) =>
        columns
            .slice(index + 1)
            .filter((payingColumn, offset) => !!canColumnPay.at(index + 1 + offset))
            .map((payingColumn) => ({columnKey: payingColumn.key, minWidth: payingColumn.fitWidth ?? 0})),
    );

    const columnWidths = {...baseColumnWidths};

    for (const [index, column] of columns.entries()) {
        const overriddenWidth = columnWidthOverrides?.[column.key];

        // A declared width can't be dragged, so a width stored for it is stale.
        if (overriddenWidth === undefined || column.hasDeclaredWidth) {
            continue;
        }

        const width = getStoredColumnWidth(overriddenWidth);
        const payingColumns = payingColumnsByIndex.at(index) ?? [];
        const absorbedWidths = getAbsorbedColumnWidths(
            payingColumns.map((payingColumn) => ({startWidth: columnWidths[payingColumn.columnKey] ?? 0, minWidth: payingColumn.minWidth})),
            width - (columnWidths[column.key] ?? 0),
        );

        columnWidths[column.key] = width;

        for (const [payingIndex, payingColumn] of payingColumns.entries()) {
            columnWidths[payingColumn.columnKey] = absorbedWidths.at(payingIndex) ?? 0;
        }
    }

    return {columnWidths, payingColumnsByIndex};
}

export default resolveOverriddenColumnWidths;
export type {OverridableColumn};
