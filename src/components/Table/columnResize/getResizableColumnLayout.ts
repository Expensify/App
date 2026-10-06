/** Lays a resizable table's columns out as custom property expressions, so a drag repaints the header, rows and scroller without a render. */
import type {TableColumn, TableData} from '@components/Table/types';

import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {ResizableColumn} from './types';

import applyColumnWidthOverrides from './applyColumnWidthOverrides';
import {getColumnsWidthExpression, getGrowableColumnTrack} from './columnWidthExpressions';

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

    /** Width each content-sized column's content and header need, which paying for another column never squeezes it below. */
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

    /** Columns whose right edge the user can drag, in render order. */
    resizableColumns: ResizableColumn[];

    /** Widths after stored overrides, which drags start from. */
    resolvedColumnWidths: Record<string, number>;
};

/**
 * First column of the trailing headless run, like an arrow, menu or icon, which absorbs leftover width to stay pinned right.
 * `undefined` when the last column has a heading, and leftover room then stays empty.
 */
function getGrowableColumnKey<DataType extends TableData, ColumnKey extends string>(columns: Array<TableColumn<ColumnKey, DataType>>): ColumnKey | undefined {
    let growableColumnKey: ColumnKey | undefined;

    for (let index = columns.length - 1; index >= 0; index--) {
        const column = columns.at(index);

        if (!column || column.label) {
            break;
        }

        growableColumnKey = column.key;
    }

    return growableColumnKey;
}

function getResizableColumnLayout<DataType extends TableData, ColumnKey extends string>({
    columns,
    resolvedColumnWidths,
    columnWidthOverrides,
    fitColumnWidths,
    tableWidth,
    rowChromeWidths: {selectionColumnWidth, totalGapWidth, rowMarginWidth, rowPaddingWidth},
}: GetResizableColumnLayoutParams<DataType, ColumnKey>): ResizableColumnLayout {
    const growableColumnKey = getGrowableColumnKey(columns);

    const {columnWidths, columnWidthValues, resizableColumns} = applyColumnWidthOverrides({
        columns: columns.map((column) => ({
            key: column.key,
            label: column.label,
            hasDeclaredWidth: typeof column.width === 'number',
            fitWidth: fitColumnWidths[column.key],
        })),
        baseColumnWidths: resolvedColumnWidths,
        columnWidthOverrides,
        growableColumnKey,
    });

    // Row width sums the widths, not the tracks, so the growable track only grows into real leftover room.
    const gridTemplateColumns = columnWidthValues.map((widthValue, index) => (columns.at(index)?.key === growableColumnKey ? getGrowableColumnTrack(widthValue) : widthValue));

    const rowWidthValues = selectionColumnWidth > 0 ? [`${selectionColumnWidth}px`, ...columnWidthValues] : columnWidthValues;

    // Scroll at the live column sum, so a drag that exhausts the paying columns starts scrolling mid-drag.
    return {
        gridTemplateColumns,
        scrollWidth: getColumnsWidthExpression(rowWidthValues, totalGapWidth + rowMarginWidth + rowPaddingWidth, '100%'),
        // Without the outer margin. Floored at px because `100%` resolves against the list cell, which includes the margin.
        rowWidth: getColumnsWidthExpression(rowWidthValues, totalGapWidth + rowPaddingWidth, `${tableWidth - rowMarginWidth}px`),
        resizableColumns,
        resolvedColumnWidths: columnWidths,
    };
}

export default getResizableColumnLayout;
