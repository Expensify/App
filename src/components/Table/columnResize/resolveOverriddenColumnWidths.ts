/** Applies stored drag widths to a table's columns, taking each difference out of the columns to its right. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {ColumnAbsorber} from './getAbsorbedColumnWidths';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';

/** What resizing needs to know about a column, whatever lays the columns out. */
type OverridableColumn = {
    /** Key a stored width is filed under. */
    key: string;

    /** Headless columns hold fixed-size content like an icon, checkbox or arrow, so they never absorb. */
    label: string;

    /** Columns with a declared width don't share the row. */
    hasDeclaredWidth: boolean;

    /** Width its content and header need, which absorbing another column's resize never squeezes it below. `undefined` when unknown. */
    fitWidth: number | undefined;
};

type ResolveOverriddenColumnWidthsParams = {
    /** Every column, in render order. */
    columns: OverridableColumn[];

    /** Widths before stored overrides are applied. */
    baseColumnWidths: Record<string, number>;

    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Width the row has for its columns, which absorbers keep it at. */
    availableColumnsWidth: number;
};

/** Whole px, deliberately not clamped: stored widths may legitimately fall outside drag bounds. */
function getStoredColumnWidth(width: number): number {
    return Math.max(Math.round(width), 0);
}

/**
 * The part of a resize the absorbers take: only what would move the row away from the available width. Widening first
 * fills leftover room, and narrowing first takes back overflow, so a column narrowed in an overflowing row shrinks the
 * scroll width instead of growing the columns after it.
 */
function getAbsorbedDelta(delta: number, overflowWidth: number): number {
    const overflowAfterResize = overflowWidth + delta;

    return delta > 0 ? Math.min(Math.max(overflowAfterResize, 0), delta) : Math.max(Math.min(overflowAfterResize, 0), delta);
}

/**
 * Applies stored widths in render order, each absorbed by the later columns still sharing the row (not headless, fixed
 * or user-sized) down to their fit width. A drag resolves through here too, so columns don't jump on release.
 */
function resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides, availableColumnsWidth}: ResolveOverriddenColumnWidthsParams): Record<string, number> {
    const canColumnAbsorb = (column: OverridableColumn) => !!column.label && !column.hasDeclaredWidth && columnWidthOverrides?.[column.key] === undefined;
    const columnWidths = {...baseColumnWidths};

    for (const [index, column] of columns.entries()) {
        const overriddenWidth = columnWidthOverrides?.[column.key];

        // A declared width can't be dragged, so a width stored for it is stale.
        if (overriddenWidth === undefined || column.hasDeclaredWidth) {
            continue;
        }

        const width = getStoredColumnWidth(overriddenWidth);
        const delta = width - (columnWidths[column.key] ?? 0);
        const overflowWidth = columns.reduce((total, rowColumn) => total + (columnWidths[rowColumn.key] ?? 0), 0) - availableColumnsWidth;
        const absorbers = columns
            .slice(index + 1)
            .filter(canColumnAbsorb)
            .map((absorber): ColumnAbsorber => ({columnKey: absorber.key, minWidth: absorber.fitWidth ?? 0}));

        Object.assign(columnWidths, getAbsorbedColumnWidths(absorbers, columnWidths, getAbsorbedDelta(delta, overflowWidth)));
        columnWidths[column.key] = width;
    }

    return columnWidths;
}

export default resolveOverriddenColumnWidths;
export type {OverridableColumn};
