/** Lays a resizable table's columns out as custom property expressions, so a drag repaints the header, rows and scroller without a render. */
import type {TableColumn, TableData} from '@components/Table/types';

import CONST from '@src/CONST';
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import applyColumnWidthOverrides from './applyColumnWidthOverrides';
import {getColumnsWidthExpression, getGrowableColumnTrack} from './columnWidthExpressions';
import resolveOverriddenColumnWidths from './resolveOverriddenColumnWidths';

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

type GetResizableColumnLayoutParams<DataType extends TableData, ColumnKey extends string> = {
    /** Every column, in render order. */
    columns: Array<TableColumn<ColumnKey, DataType>>;

    /** Widths before stored overrides are applied, fixed columns included. */
    resolvedColumnWidths: Record<string, number>;

    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** Width each content-sized column's content and header need, which absorbing another column's resize never squeezes it below. */
    fitColumnWidths: Record<string, number>;

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

    /** Every column's width with one column resized, resolved like a stored width so the drag paints what release keeps. */
    getResizedColumnWidths: (columnKey: string, width: number) => Record<string, number>;

    /** Width drags start from: stored overrides applied, and the growable column at its painted width. */
    resolvedColumnWidths: Record<string, number>;

    /** The narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths: Record<string, number>;
};

function getColumnsWidthSum<DataType extends TableData, ColumnKey extends string>(columns: Array<TableColumn<ColumnKey, DataType>>, columnWidths: Record<string, number>): number {
    return columns.reduce((total, column) => total + (columnWidths[column.key] ?? 0), 0);
}

function getResizableColumnLayout<DataType extends TableData, ColumnKey extends string>({
    columns,
    resolvedColumnWidths,
    columnWidthOverrides,
    fitColumnWidths,
    tableWidth,
    rowChromeWidths: {selectionColumnWidth, totalGapWidth, rowMarginWidth, rowPaddingWidth},
}: GetResizableColumnLayoutParams<DataType, ColumnKey>): ResizableColumnLayout {
    // Absorbs leftover width, so trailing headless columns like an arrow, menu or icon keep their size and stay pinned right.
    const growableColumnKey = columns.findLast((column) => !!column.label)?.key;
    const availableColumnsWidth = tableWidth - rowMarginWidth - selectionColumnWidth - totalGapWidth - rowPaddingWidth;
    const baseColumnWidths = {...resolvedColumnWidths};

    // Absorbs wider columns to its left from the room it paints, leftover included.
    // Floored so the row never overflows the table by a fraction of a pixel.
    if (growableColumnKey) {
        const leftoverWidth = Math.floor(availableColumnsWidth - getColumnsWidthSum(columns, resolvedColumnWidths));
        baseColumnWidths[growableColumnKey] = (baseColumnWidths[growableColumnKey] ?? 0) + Math.max(leftoverWidth, 0);
    }

    const overridableColumns = columns.map((column) => ({
        key: column.key,
        label: column.label,
        hasDeclaredWidth: typeof column.width === 'number',
        fitWidth: fitColumnWidths[column.key],
    }));
    const {columnWidths, columnWidthValues, resizableColumnKeys} = applyColumnWidthOverrides({columns: overridableColumns, baseColumnWidths, columnWidthOverrides, availableColumnsWidth});

    const getResizedColumnWidths = (columnKey: string, width: number) =>
        resolveOverriddenColumnWidths({columns: overridableColumns, baseColumnWidths, columnWidthOverrides: {...columnWidthOverrides, [columnKey]: width}, availableColumnsWidth});

    // Row width sums the widths, not the tracks, so the growable track only grows into real leftover room.
    const gridTemplateColumns = columnWidthValues.map((widthValue, index) => (columns.at(index)?.key === growableColumnKey ? getGrowableColumnTrack(widthValue) : widthValue));

    const rowWidthValues = selectionColumnWidth > 0 ? [`${selectionColumnWidth}px`, ...columnWidthValues] : columnWidthValues;

    const overflowWidth = getColumnsWidthSum(columns, columnWidths) - availableColumnsWidth;
    const dragStartWidths = {...columnWidths};
    const dragMinWidths: Record<string, number> = {};

    if (growableColumnKey && resizableColumnKeys.includes(growableColumnKey)) {
        // Drags start from the painted track, which includes the leftover it grew into, so the first pixels of travel aren't dead.
        const paintedWidth = (columnWidths[growableColumnKey] ?? 0) + Math.max(-overflowWidth, 0);
        dragStartWidths[growableColumnKey] = paintedWidth;

        // Shrinking may only take back the overflow. Anything more would stretch the trailing headless columns or leave
        // empty room at the row's end. Rounded up so the row never ends a fraction of a pixel short of the table.
        const minWidth = Math.max(Math.ceil(paintedWidth - Math.max(overflowWidth, 0)), CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH);

        // A width already below the drag bound stays put rather than jumping wider.
        dragMinWidths[growableColumnKey] = Math.min(minWidth, paintedWidth);
    }

    // Scroll at the live column sum, so a drag that exhausts the absorbers starts scrolling mid-drag.
    return {
        gridTemplateColumns,
        scrollWidth: getColumnsWidthExpression(rowWidthValues, totalGapWidth + rowMarginWidth + rowPaddingWidth, '100%'),
        // Without the outer margin. Floored at px because `100%` resolves against the list cell, which includes the margin.
        rowWidth: getColumnsWidthExpression(rowWidthValues, totalGapWidth + rowPaddingWidth, `${tableWidth - rowMarginWidth}px`),
        resizableColumnKeys,
        getResizedColumnWidths,
        resolvedColumnWidths: dragStartWidths,
        dragMinWidths,
    };
}

export default getResizableColumnLayout;
