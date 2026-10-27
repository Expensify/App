/** Works out what a drag paints: the dragged column at its new width, with the change taken out of the auto-sized columns to its right. */
import type {ColumnAbsorber} from './getAbsorbedColumnWidths';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';
import getColumnsWidthSum from './getColumnsWidthSum';

/** What resizing needs to know about a column, whatever lays the columns out. */
type ResizableColumn = {
    /** Key a stored width is filed under. */
    key: string;

    /** Headless columns hold fixed-size content like an icon, checkbox or arrow, so they never resize. */
    label: string;

    /** Width the column declares, which it always keeps, so it doesn't share the row. `undefined` when content-sized. */
    declaredWidth: number | undefined;

    /** Width its content and header need. `0` when not measured. */
    contentWidth: number;

    /** The layout's minimum, which absorbing never goes below. */
    minWidth: number;

    /** Width absorbing another column's resize never grows it past. `Infinity` when uncapped. */
    maxWidth: number;
};

/** A headless column held at one width, so it never resizes or takes the leftover room. Its real header still renders. */
function getPinnedColumn(key: string, width: number): ResizableColumn {
    return {key, label: '', declaredWidth: width, contentWidth: width, minWidth: width, maxWidth: width};
}

type ResolveDraggedColumnWidthsParams = {
    /** Every column, in render order. */
    columns: ResizableColumn[];

    /** Painted widths when the drag started. */
    startWidths: Record<string, number>;

    /** Columns the user dragged, which keep their width. */
    resizedColumnKeys: string[];

    /** Width the row has for its columns, which absorbers keep it at. */
    availableColumnsWidth: number;

    columnKey: string;

    /** Width the pointer puts the dragged column at. */
    width: number;
};

/** Only headed, content-sized columns share the row. Columns with a declared width, like a switch, status or count, hold fixed-size content. */
function isColumnResizable(column: ResizableColumn): boolean {
    return !!column.label && column.declaredWidth === undefined;
}

/** The columns that give or take room when another width changes: resizable and never dragged by the user. */
function getColumnAbsorbers(columns: ResizableColumn[], resizedColumnKeys: string[]): ColumnAbsorber[] {
    return columns
        .filter((column) => isColumnResizable(column) && !resizedColumnKeys.includes(column.key))
        .map((column) => ({columnKey: column.key, minWidth: column.minWidth, maxWidth: column.maxWidth}));
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
 * Columns left of the dragged one stay put, so its edge stays under the pointer. The change is split equally between
 * the auto-sized columns to its right, within their minimum and maximum. Returns the dragged column and every absorber that moved.
 */
function resolveDraggedColumnWidths({columns, startWidths, resizedColumnKeys, availableColumnsWidth, columnKey, width}: ResolveDraggedColumnWidthsParams): Record<string, number> {
    const draggedIndex = columns.findIndex((column) => column.key === columnKey);
    const delta = width - (startWidths[columnKey] ?? 0);
    const overflowWidth = getColumnsWidthSum(columns, startWidths) - availableColumnsWidth;
    const absorbers = getColumnAbsorbers(columns.slice(draggedIndex + 1), resizedColumnKeys);

    return {...getAbsorbedColumnWidths(absorbers, startWidths, getAbsorbedDelta(delta, overflowWidth)), [columnKey]: width};
}

export default resolveDraggedColumnWidths;
export {getAbsorbedDelta, getColumnAbsorbers, getPinnedColumn, isColumnResizable};
export type {ResizableColumn};
