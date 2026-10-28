/** Lays a resizable table's columns out as custom property expressions, so a drag repaints the header, rows and scroller without a render. */

import calculateDynamicColumnWidths, {distributeEqualWidths} from '@components/Table/calculateDynamicColumnWidths';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {ResizableColumn} from './resolveDraggedColumnWidths';

import {SCROLL_EXTENT_FLOOR_VARIABLE, getColumnWidthValue, getColumnsWidthExpression, getGrowableColumnTrack} from './columnWidthExpressions';
import getColumnsWidthSum from './getColumnsWidthSum';
import resolveDraggedColumnWidths, {isColumnResizable} from './resolveDraggedColumnWidths';

type ColumnWidthTarget = ValueOf<typeof CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET>;

/** Row space that isn't column width, so it can be added back around the column sum. */
type RowChromeWidths = {
    /** Leading checkbox column, `0` when selection is off. */
    selectionColumnWidth: number;

    /** Every gap between columns, the selection column included. */
    totalGapWidth: number;

    /** Outer margin on both sides, which the rows keep inside the scrolled content. */
    rowMarginWidth: number;

    /** Inner padding on both sides. */
    rowPaddingWidth: number;
};

type GetResizableColumnLayoutParams = {
    /** Every column, in render order. */
    columns: ResizableColumn[];

    /** Before the growable column takes the leftover. Fixed columns included. */
    resolvedColumnWidths: Record<string, number>;

    /** Columns the user dragged, which never absorb another column's drag. */
    resizedColumnKeys: string[];

    /** Measured width of the area the table renders into. */
    tableWidth: number;

    rowChromeWidths: RowChromeWidths;
};

type ResizableColumnLayout = {
    /** Grid tracks reading each column's width custom property. */
    gridTemplateColumns: string[];

    /** Scroller content width, floored at the table so it stays full-width. */
    scrollWidth: string;

    /** Row box width, which is `scrollWidth` minus the outer margin. */
    rowWidth: string;

    /** Keys of the columns whose right edge the user can drag, in render order. */
    resizableColumnKeys: string[];

    /** The dragged column's width and the widths of the columns that absorb it, painted mid-drag. */
    getResizedColumnWidths: (columnKey: string, width: number) => Record<string, number>;

    /** Width drags start from, with the growable column at its painted width. */
    resolvedColumnWidths: Record<string, number>;

    /** The narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths: Record<string, number>;

    /**
     * `fit`: the column's content within the drag bounds, `undefined` when its edge doesn't drag.
     * `reset`: the width a fresh load gives it, within the drag bounds, `undefined` when the user never resized it.
     */
    getTargetColumnWidth: (columnKey: string, target: ColumnWidthTarget) => number | undefined;
};

/** Table width minus selection column, gaps, margin and padding. Floored because tracks are whole px. */
function getAvailableColumnsWidth(tableWidth: number, {selectionColumnWidth, totalGapWidth, rowMarginWidth, rowPaddingWidth}: RowChromeWidths): number {
    return Math.floor(tableWidth - rowMarginWidth - selectionColumnWidth - totalGapWidth - rowPaddingWidth);
}

/** Widths content sizing gives the columns before any resize, which is what a reset hands a column back to. */
function getDefaultColumnWidths(columns: ResizableColumn[], availableColumnsWidth: number): Record<string, number> {
    const contentSizedColumns = columns.filter((column) => column.declaredWidth === undefined);
    const fixedColumnsWidth = columns.reduce((total, column) => total + (column.declaredWidth ?? 0), 0);
    const availableWidth = availableColumnsWidth - fixedColumnsWidth;
    const {widths} = calculateDynamicColumnWidths(contentSizedColumns, availableWidth);
    const defaultWidths = widths.length > 0 ? widths : distributeEqualWidths(contentSizedColumns.length, availableWidth);

    return Object.fromEntries(contentSizedColumns.map((column, index) => [column.key, defaultWidths.at(index) ?? 0]));
}

function getResizableColumnLayout({columns, resolvedColumnWidths, resizedColumnKeys, tableWidth, rowChromeWidths}: GetResizableColumnLayoutParams): ResizableColumnLayout {
    const {selectionColumnWidth, totalGapWidth, rowMarginWidth, rowPaddingWidth} = rowChromeWidths;
    // Absorbs leftover width, so trailing headless columns like an arrow, menu or icon keep their size and stay pinned right.
    const growableColumnKey = columns.findLast((column) => !!column.label)?.key;
    const availableColumnsWidth = getAvailableColumnsWidth(tableWidth, rowChromeWidths);
    const columnWidths = {...resolvedColumnWidths};
    const resizableColumnKeys = columns.filter(isColumnResizable).map((column) => column.key);
    const isGrowableColumnResizable = !!growableColumnKey && resizableColumnKeys.includes(growableColumnKey);

    // Absorbs wider columns to its left from the room it paints, leftover included, so the first pixels of a drag on it aren't dead.
    // A fixed-width column only fills the leftover through its track, so a drag takes that room before the row overflows.
    // Floored so the row never overflows the table by a fraction of a pixel.
    if (growableColumnKey && isGrowableColumnResizable) {
        const leftoverWidth = Math.floor(availableColumnsWidth - getColumnsWidthSum(columns, resolvedColumnWidths));
        columnWidths[growableColumnKey] = (columnWidths[growableColumnKey] ?? 0) + Math.max(leftoverWidth, 0);
    }

    const columnWidthValues = columns.map((column) => getColumnWidthValue(column.key, columnWidths[column.key] ?? 0));

    // Row width sums the widths, not the tracks, so the growable track only grows into real leftover room.
    const gridTemplateColumns = columnWidthValues.map((widthValue, index) => (columns.at(index)?.key === growableColumnKey ? getGrowableColumnTrack(widthValue) : widthValue));

    const rowWidthValues = selectionColumnWidth > 0 ? [`${selectionColumnWidth}px`, ...columnWidthValues] : columnWidthValues;

    const dragMinWidths: Record<string, number> = {};

    if (growableColumnKey && isGrowableColumnResizable) {
        const paintedWidth = columnWidths[growableColumnKey] ?? 0;
        const overflowWidth = getColumnsWidthSum(columns, columnWidths) - availableColumnsWidth;

        // Shrinking may only take back the overflow. Anything more would stretch the trailing headless columns or leave
        // empty room at the row's end. Rounded up so the row never ends a fraction of a pixel short of the table.
        const minWidth = Math.max(Math.ceil(paintedWidth - Math.max(overflowWidth, 0)), CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH);

        // A width already below the drag bound stays put rather than jumping wider.
        dragMinWidths[growableColumnKey] = Math.min(minWidth, paintedWidth);
    }

    // Held to the same bounds as a drag, so a fit never leaves the room a drag couldn't, which the growable column would take back on the next render.
    const getDragBoundedWidth = (columnKey: string, width: number) => Math.max(Math.round(width), dragMinWidths[columnKey] ?? CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH);

    const getTargetColumnWidth = (columnKey: string, target: ColumnWidthTarget) => {
        const column = columns.find((candidate) => candidate.key === columnKey);

        if (!column) {
            return undefined;
        }

        if (target === CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.FIT) {
            return isColumnResizable(column) ? getDragBoundedWidth(columnKey, column.contentWidth) : undefined;
        }

        if (!resizedColumnKeys.includes(columnKey)) {
            return undefined;
        }

        return getDragBoundedWidth(columnKey, getDefaultColumnWidths(columns, availableColumnsWidth)[columnKey] ?? 0);
    };

    const getResizedColumnWidths = (columnKey: string, width: number) =>
        resolveDraggedColumnWidths({columns, startWidths: columnWidths, resizedColumnKeys, availableColumnsWidth, columnKey, width});

    // Scroll at the live column sum, so a drag that exhausts the absorbers starts scrolling mid-drag.
    return {
        gridTemplateColumns,
        scrollWidth: getColumnsWidthExpression(rowWidthValues, totalGapWidth + rowMarginWidth + rowPaddingWidth, `max(100%, var(${SCROLL_EXTENT_FLOOR_VARIABLE}, 0px))`),
        // Without the outer margin. Floored at px because `100%` resolves against the list cell, which includes the margin.
        rowWidth: getColumnsWidthExpression(rowWidthValues, totalGapWidth + rowPaddingWidth, `${tableWidth - rowMarginWidth}px`),
        resizableColumnKeys,
        getResizedColumnWidths,
        resolvedColumnWidths: columnWidths,
        dragMinWidths,
        getTargetColumnWidth,
    };
}

export default getResizableColumnLayout;
export {getAvailableColumnsWidth};
export type {ColumnWidthTarget};
