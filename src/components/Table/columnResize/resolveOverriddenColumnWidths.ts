/** Applies stored drag widths to a table's columns, taking each difference out of the columns to its right. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {ColumnAbsorber} from './types';

import {getResizedColumnWidths} from './columnResizeGestures';

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
};

type ResolvedOverriddenColumnWidths = {
    /** Widths after every stored override and its absorbers are applied. */
    columnWidths: Record<string, number>;

    /** Each column's absorbers by its key, in render order. */
    absorbersByColumnKey: Record<string, ColumnAbsorber[]>;
};

/** Whole px, deliberately not clamped: stored widths may legitimately fall outside drag bounds. */
function getStoredColumnWidth(width: number): number {
    return Math.max(Math.round(width), 0);
}

/**
 * Applies stored widths in render order, each absorbed by the later columns still sharing the row (not headless, fixed
 * or user-sized) down to their fit width. Uses the same split as the drag, so columns don't jump on release.
 */
function resolveOverriddenColumnWidths({columns, baseColumnWidths, columnWidthOverrides}: ResolveOverriddenColumnWidthsParams): ResolvedOverriddenColumnWidths {
    const canColumnAbsorb = (column: OverridableColumn) => !!column.label && !column.hasDeclaredWidth && columnWidthOverrides?.[column.key] === undefined;

    const absorbersByColumnKey = Object.fromEntries(
        columns.map((column, index) => [
            column.key,
            columns
                .slice(index + 1)
                .filter(canColumnAbsorb)
                .map((absorber): ColumnAbsorber => ({columnKey: absorber.key, minWidth: absorber.fitWidth ?? 0})),
        ]),
    );

    const columnWidths = {...baseColumnWidths};

    for (const column of columns) {
        const overriddenWidth = columnWidthOverrides?.[column.key];

        // A declared width can't be dragged, so a width stored for it is stale.
        if (overriddenWidth === undefined || column.hasDeclaredWidth) {
            continue;
        }

        Object.assign(
            columnWidths,
            getResizedColumnWidths({
                columnKey: column.key,
                width: getStoredColumnWidth(overriddenWidth),
                startWidth: columnWidths[column.key] ?? 0,
                absorbers: absorbersByColumnKey[column.key] ?? [],
                absorberStartWidths: columnWidths,
            }),
        );
    }

    return {columnWidths, absorbersByColumnKey};
}

export default resolveOverriddenColumnWidths;
export type {OverridableColumn};
