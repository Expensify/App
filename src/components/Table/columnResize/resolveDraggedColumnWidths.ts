/** Works out what a drag paints: the dragged column at its new width, with the change taken out of the unset columns to its right. */
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {ColumnAbsorber} from './getAbsorbedColumnWidths';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';
import getColumnsWidthSum from './getColumnsWidthSum';

/** What resizing needs to know about a column, whatever lays the columns out. */
type ResizableColumn = {
    /** Key a stored width is filed under. */
    key: string;

    /** Headless columns hold fixed-size content like an icon, checkbox or arrow, so they never resize. */
    label: string;

    /** Columns with a declared width don't share the row. */
    hasDeclaredWidth: boolean;

    /** Width its content and header need, which absorbing another column's resize never squeezes it below. `undefined` when unknown. */
    fitWidth: number | undefined;

    /** Width absorbing another column's resize never grows it past. `undefined` when uncapped. */
    maxWidth: number | undefined;
};

type ResolveDraggedColumnWidthsParams = {
    /** Every column, in render order. */
    columns: ResizableColumn[];

    /** Painted widths when the drag started. */
    startWidths: Record<string, number>;

    /** Widths the user set. Those columns keep their width while another column is dragged. */
    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Width the row has for its columns, which absorbers keep it at. */
    availableColumnsWidth: number;

    columnKey: string;

    /** Width the pointer puts the dragged column at. */
    width: number;
};

/** Only headed, content-sized columns share the row. Columns with a declared width, like a switch, status or count, hold fixed-size content. */
function isColumnResizable(column: ResizableColumn): boolean {
    return !!column.label && !column.hasDeclaredWidth;
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
 * Columns to the left of the dragged one stay as painted, so its edge stays under the pointer. The change is split
 * equally between the unset columns to its right, down to their fit width and up to their maximum. Columns the user
 * set keep their width. Returns the dragged column and every absorber that moved.
 */
function resolveDraggedColumnWidths({columns, startWidths, columnWidthOverrides, availableColumnsWidth, columnKey, width}: ResolveDraggedColumnWidthsParams): Record<string, number> {
    const draggedIndex = columns.findIndex((column) => column.key === columnKey);
    const delta = width - (startWidths[columnKey] ?? 0);
    const overflowWidth = getColumnsWidthSum(columns, startWidths) - availableColumnsWidth;
    const absorbers = columns
        .slice(draggedIndex + 1)
        .filter((column) => isColumnResizable(column) && columnWidthOverrides?.[column.key] === undefined)
        .map((column): ColumnAbsorber => ({columnKey: column.key, minWidth: column.fitWidth ?? 0, maxWidth: column.maxWidth ?? Number.POSITIVE_INFINITY}));

    return {...getAbsorbedColumnWidths(absorbers, startWidths, getAbsorbedDelta(delta, overflowWidth)), [columnKey]: width};
}

export default resolveDraggedColumnWidths;
export {isColumnResizable};
export type {ResizableColumn};
