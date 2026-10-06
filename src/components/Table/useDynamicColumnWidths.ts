import useThemeStyles from '@hooks/useThemeStyles';

import measureTextWidth, {canMeasureText} from '@libs/measureTextWidth';
import createWidestTextMeasurer from '@libs/measureTextWidth/widestTextMeasurer';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

import type {DynamicColumnConstraints} from './calculateDynamicColumnWidths';
import type {TableColumn, TableData} from './types';

import calculateDynamicColumnWidths, {distributeEqualWidths} from './calculateDynamicColumnWidths';
import getResizableColumnLayout from './columnResize/getResizableColumnLayout';

const {MIN_FREE_TEXT_COLUMN_WIDTH} = CONST.TABLES.DYNAMIC_COLUMNS;

type UseDynamicColumnWidthsParams<DataType extends TableData, ColumnKey extends string> = {
    /** Column configuration for the table. */
    columns: Array<TableColumn<ColumnKey, DataType>>;

    /**
     * The table's rows. This is the unprocessed data rather than the filtered/sorted result, so column widths stay put
     * while the user searches or filters instead of reflowing on every keystroke.
     */
    data: DataType[];

    /** Measured width of the area the table renders into, including the rows' own margin and padding. */
    tableWidth: number;

    /** Whether dynamic sizing should run at all. Callers pass `false` on narrow layouts and when they haven't opted in. */
    isEnabled: boolean;

    /** Whether the leading selection checkbox column is rendered, since it takes width from the data columns. */
    hasSelectionColumn: boolean;

    /** Whether columns are resizable, which forces px tracks read from custom properties. */
    isColumnResizingEnabled: boolean;

    /** Widths the user dragged this table's columns to. */
    columnWidthOverrides: ColumnWidthOverrides | undefined;
};

type UseDynamicColumnWidthsResult = {
    /** Grid tracks for the header and rows. `undefined` keeps the static tracks of fixed widths and `1fr` shares. */
    gridTemplateColumns: string[] | undefined;

    /** Row width when columns overflow. A CSS expression while resizable, so drags scroll without a re-render. */
    scrollWidth: number | string | undefined;

    /** Row box width while resizable, which is `scrollWidth` minus the outer margin. `undefined` otherwise. */
    rowWidth: string | undefined;

    /** Keys of the columns whose right edge the user can drag, in column order. Empty unless the columns are resizable. */
    resizableColumnKeys: string[];

    /** Every column's width with one column resized, which a drag paints. */
    getResizedColumnWidths: (columnKey: string, width: number) => Record<string, number>;

    /** Each column's resolved width, which a drag starts from. */
    resolvedColumnWidths: Record<string, number>;

    /** Narrowest width a drag may take a column to, for columns tighter than the default drag bound. */
    dragMinWidths: Record<string, number>;
};

/**
 * Measures how wide a column's widest cell content renders, or `null` when the platform can't measure text.
 */
function measureColumnContentWidth<DataType extends TableData, ColumnKey extends string>(column: TableColumn<ColumnKey, DataType>, data: DataType[]): number | null {
    const dynamicSizing = column.dynamicSizing;

    if (!dynamicSizing) {
        return 0;
    }

    const measurer = createWidestTextMeasurer();

    for (const item of data) {
        for (const content of dynamicSizing.getContentToMeasure(item)) {
            measurer.add(content.text, {fontSize: content.fontSize, fontWeight: content.fontWeight});
        }
    }

    const widestContentWidth = measurer.getWidestWidth();

    if (widestContentWidth === null) {
        return null;
    }

    // A column with no measured text and no extraWidth genuinely never shows anything, so it needs 0px. A column with
    // extraWidth still has non-text content to fit (e.g. an icon with no accompanying text on some rows), so its width
    // is not skipped just because no row's text happened to measure wider than the others.
    if (widestContentWidth === 0 && !dynamicSizing.extraWidth) {
        return 0;
    }

    // Rounded up because the widths end up as whole px grid tracks. Rounding a fraction down would leave a column
    // narrower than the text it was sized to hold, and the browser would put an ellipsis on text that fits.
    return Math.ceil(widestContentWidth + (dynamicSizing.extraWidth ?? 0));
}

/**
 * Measures how wide a column's header label renders, or `null` when the platform can't measure text. The label is
 * measured in the bold font the header uses while the column is sorted, so sorting a column never truncates its label.
 */
function measureHeaderLabelWidth(label: string, sortIconWidth: number): number | null {
    const width = measureTextWidth(label, {fontSize: fontScale.micro, fontWeight: '700'});

    if (width === null) {
        return null;
    }

    // Rounded up for the same reason as the cell content above.
    return width === 0 ? 0 : Math.ceil(width + sortIconWidth);
}

/**
 * Resolves the CSS grid tracks for a table whose columns are sized from their content.
 *
 * The tracks have to be identical for the header and every data row, because each row is its own grid: a content-based
 * CSS track (`max-content`) would resolve per row, leaving the columns out of line. So the widths are measured once and
 * shared, and the result is a plain track list the header and rows both render.
 *
 * Returns `undefined` when dynamic sizing doesn't apply: it isn't enabled, the table hasn't been measured yet, text
 * can't be measured (native), or the content already fits in equal columns. Callers then fall back to the table's
 * static tracks.
 */
function useDynamicColumnWidths<DataType extends TableData, ColumnKey extends string = string>({
    columns,
    data,
    tableWidth,
    isEnabled,
    hasSelectionColumn,
    isColumnResizingEnabled,
    columnWidthOverrides,
}: UseDynamicColumnWidthsParams<DataType, ColumnKey>): UseDynamicColumnWidthsResult {
    const styles = useThemeStyles();

    const noDynamicWidths: UseDynamicColumnWidthsResult = {
        gridTemplateColumns: undefined,
        scrollWidth: undefined,
        rowWidth: undefined,
        resizableColumnKeys: [],
        getResizedColumnWidths: (columnKey, width) => ({[columnKey]: width}),
        resolvedColumnWidths: {},
        dragMinWidths: {},
    };

    // Checked before anything else, so native never walks the data to gather text that it can't measure anyway.
    if (!isEnabled || tableWidth <= 0 || !canMeasureText()) {
        return noDynamicWidths;
    }

    const dynamicColumns: Array<TableColumn<ColumnKey, DataType>> = [];
    const fixedColumnWidths = new Map<ColumnKey, number>();
    let fixedColumnsWidth = 0;

    for (const column of columns) {
        // A column with a percentage or other non-numeric width can't be subtracted from the budget, so the whole
        // table keeps its static tracks rather than being laid out from a wrong budget.
        if (column.width !== undefined && typeof column.width !== 'number') {
            return noDynamicWidths;
        }

        if (typeof column.width === 'number') {
            fixedColumnWidths.set(column.key, column.width);
            fixedColumnsWidth += column.width;
        } else {
            dynamicColumns.push(column);
        }
    }

    if (dynamicColumns.length === 0) {
        return noDynamicWidths;
    }

    const selectionColumnWidth = hasSelectionColumn ? variables.tableCheckboxColumnWidth : 0;
    const totalColumnCount = columns.length + (hasSelectionColumn ? 1 : 0);
    const totalGapWidth = Math.max(totalColumnCount - 1, 0) * styles.gap3.gap;
    const rowMarginWidth = styles.mh5.marginHorizontal * 2;
    const rowPaddingWidth = styles.ph3.paddingHorizontal * 2;
    const rowChromeWidth = rowMarginWidth + rowPaddingWidth;
    // Floored because the tracks are whole px. A fractional budget leaves a fraction over once they are rounded, and
    // handing it to a column would put a sub-pixel track in the row. Rounding down keeps the columns inside the table.
    const availableWidth = Math.floor(tableWidth - rowChromeWidth - totalGapWidth - fixedColumnsWidth - selectionColumnWidth);
    if (availableWidth <= 0) {
        return noDynamicWidths;
    }

    const constraints: DynamicColumnConstraints[] = [];
    const fitColumnWidths: Record<string, number> = {};

    for (const column of dynamicColumns) {
        const contentWidth = measureColumnContentWidth(column, data);
        const headerLabelWidth = measureHeaderLabelWidth(column.label, variables.iconSizeExtraSmall + styles.ml1.marginLeft);

        // Text measurement is unavailable (native), so the table keeps its static, content-independent tracks.
        if (contentWidth === null || headerLabelWidth === null) {
            return noDynamicWidths;
        }

        // A column has to fit its header label as well as its cells, so the label is part of what its content needs
        // rather than a separate floor.
        const columnContentWidth = Math.max(contentWidth, headerLabelWidth);
        fitColumnWidths[column.key] = columnContentWidth;

        // A column holding a known, short set of values is never squeezed below its content, so it never truncates.
        // A free-text column is squeezed no further than a readable width, or its content when that is narrower.
        const readableWidth = MIN_FREE_TEXT_COLUMN_WIDTH + (column.dynamicSizing?.extraWidth ?? 0);
        const defaultMinWidth = column.dynamicSizing?.shouldFitContent ? columnContentWidth : Math.min(columnContentWidth, readableWidth);

        constraints.push({
            contentWidth: columnContentWidth,
            minWidth: column.dynamicSizing?.minWidth ?? defaultMinWidth,
            // Uncapped by default, so the table scrolls rather than truncating. A cap also can't be derived from the
            // available width without breaking the sizing: a column capped at its equal share looks like it fits in
            // one, so the columns would be left equal and the long column would stay truncated. Columns that should
            // truncate rather than widen the table set `maxWidth` themselves.
            maxWidth: column.dynamicSizing?.maxWidth ?? Number.POSITIVE_INFINITY,
        });
    }

    const {widths, shouldScrollHorizontally} = calculateDynamicColumnWidths(constraints, availableWidth);
    // Equal columns are what the static `1fr` tracks already do, but a drag needs px widths to start from.
    if (widths.length === 0 && !isColumnResizingEnabled) {
        return noDynamicWidths;
    }

    const resolvedWidths = widths.length > 0 ? widths : distributeEqualWidths(dynamicColumns.length, availableWidth);

    // Keyed by column rather than tracked with a running index, so the tracks can be built without mutating a counter
    // from inside the mapping callback (which the React Compiler can't compile).
    const resolvedColumnWidths: Record<string, number> = {};
    for (const [index, column] of dynamicColumns.entries()) {
        resolvedColumnWidths[column.key] = resolvedWidths.at(index) ?? 0;
    }

    for (const [columnKey, fixedWidth] of fixedColumnWidths) {
        resolvedColumnWidths[columnKey] = fixedWidth;
    }

    if (!isColumnResizingEnabled) {
        const gridTemplateColumns = columns.map((column) => `${resolvedColumnWidths[column.key] ?? 0}px`);

        if (!shouldScrollHorizontally) {
            return {...noDynamicWidths, gridTemplateColumns, resolvedColumnWidths};
        }

        // Rows overflow, so scroll at exactly their width. Margin is included because rows keep it inside the scrolled
        // content, and without it their trailing edge gets clipped.
        const scrollWidth = resolvedWidths.reduce((total, width) => total + width, 0) + fixedColumnsWidth + selectionColumnWidth + totalGapWidth + rowChromeWidth;

        return {...noDynamicWidths, gridTemplateColumns, scrollWidth, resolvedColumnWidths};
    }

    return getResizableColumnLayout({
        columns,
        resolvedColumnWidths,
        columnWidthOverrides,
        fitColumnWidths,
        tableWidth,
        rowChromeWidths: {selectionColumnWidth, totalGapWidth, rowMarginWidth, rowPaddingWidth},
    });
}

export default useDynamicColumnWidths;
