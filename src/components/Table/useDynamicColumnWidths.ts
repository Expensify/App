import useThemeStyles from '@hooks/useThemeStyles';

import measureTextWidth, {canMeasureText} from '@libs/measureTextWidth';
import createWidestTextMeasurer from '@libs/measureTextWidth/widestTextMeasurer';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import {useMemo} from 'react';

import type {DynamicColumnConstraints} from './calculateDynamicColumnWidths';
import type {TableColumn, TableData} from './types';

import calculateDynamicColumnWidths from './calculateDynamicColumnWidths';

const {MIN_FREE_TEXT_COLUMN_WIDTH, SCROLLED_FREE_TEXT_COLUMN_WIDTH} = CONST.TABLES.DYNAMIC_COLUMNS;

/** What a single column's sizing bounds are derived from, measured before any of them can be resolved. */
type ColumnMeasurement = {
    /** Width the column needs to render its widest cell and its header label in full, including non-text extras. */
    contentWidth: number;

    /** Width the header label alone needs, so no bound is ever tight enough to truncate it. */
    headerLabelWidth: number;

    /** Width of the cell's non-text content, e.g. an avatar plus its gap. */
    extraWidth: number;

    /** Whether the column's values come from a fixed set, so it must always show them in full. */
    shouldFitContent: boolean;

    /** Bound the column set for itself, which wins over the derived one. */
    minWidth?: number;

    /** Bound the column set for itself, which wins over the derived one. */
    maxWidth?: number;
};

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
 * The floor a free-text column is squeezed to, given the width free text may occupy in the current layout. Never
 * tight enough to truncate the header label, and sits on top of the cell's non-text content so an avatar doesn't eat
 * into the text budget.
 */
function floorFor({contentWidth, headerLabelWidth, extraWidth}: ColumnMeasurement, freeTextWidth: number): number {
    return Math.max(Math.min(contentWidth, freeTextWidth + extraWidth), headerLabelWidth);
}

/**
 * The minimum width a column resolves to: its own explicit `minWidth` if it set one, its full content when it must
 * never truncate, or the free-text floor otherwise.
 */
function minWidthFor(measurement: ColumnMeasurement, freeTextWidth: number): number {
    return measurement.minWidth ?? (measurement.shouldFitContent ? measurement.contentWidth : floorFor(measurement, freeTextWidth));
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
}: UseDynamicColumnWidthsParams<DataType, ColumnKey>): {gridTemplateColumns: string[] | undefined; scrollWidth: number | undefined} {
    const styles = useThemeStyles();

    // This `useMemo` is load-bearing rather than redundant: it is the only hook call here, so without it the React
    // Compiler sees a plain function instead of a hook and memoizes nothing (both compilers report `no-components`).
    // The measurement below would then re-run on every render, including on every keystroke in the table's search box.
    return useMemo(() => {
        const noDynamicWidths = {gridTemplateColumns: undefined, scrollWidth: undefined};

        // Checked before anything else, so native never walks the data to gather text that it can't measure anyway.
        if (!isEnabled || tableWidth <= 0 || !canMeasureText()) {
            return noDynamicWidths;
        }

        const dynamicColumns: Array<TableColumn<ColumnKey, DataType>> = [];
        let fixedColumnsWidth = 0;

        for (const column of columns) {
            // A column with a percentage or other non-numeric width can't be subtracted from the budget, so the whole
            // table keeps its static tracks rather than being laid out from a wrong budget.
            if (column.width !== undefined && typeof column.width !== 'number') {
                return noDynamicWidths;
            }

            if (typeof column.width === 'number') {
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
        const rowChromeWidth = (styles.mh5.marginHorizontal + styles.ph3.paddingHorizontal) * 2;
        // Floored because the tracks are whole px. A fractional budget leaves a fraction over once they are rounded, and
        // handing it to a column would put a sub-pixel track in the row. Rounding down keeps the columns inside the table.
        const availableWidth = Math.floor(tableWidth - rowChromeWidth - totalGapWidth - fixedColumnsWidth - selectionColumnWidth);

        if (availableWidth <= 0) {
            return noDynamicWidths;
        }

        const measurements: ColumnMeasurement[] = [];

        for (const column of dynamicColumns) {
            const contentWidth = measureColumnContentWidth(column, data);
            const headerLabelWidth = measureHeaderLabelWidth(column.label, variables.iconSizeExtraSmall + styles.ml1.marginLeft);

            // Text measurement is unavailable (native), so the table keeps its static, content-independent tracks.
            if (contentWidth === null || headerLabelWidth === null) {
                return noDynamicWidths;
            }

            measurements.push({
                // A column has to fit its header label as well as its cells, so the label is part of what its content
                // needs rather than a separate floor.
                contentWidth: Math.max(contentWidth, headerLabelWidth),
                headerLabelWidth,
                extraWidth: column.dynamicSizing?.extraWidth ?? 0,
                shouldFitContent: column.dynamicSizing?.shouldFitContent ?? false,
                minWidth: column.dynamicSizing?.minWidth,
                maxWidth: column.dynamicSizing?.maxWidth,
            });
        }

        // Once the squeeze floors themselves overflow the row, the table scrolls, and horizontal room stops being
        // scarce: squeezing every column to its narrowest then costs readability for nothing. So the floors are raised
        // to what each column's content actually needs, capped at a readable width. Raising a floor can only keep the
        // total over the row's width, so this can't flip the layout back into one that fits.
        // Clamped by `maxWidth` exactly as `calculateDynamicColumnWidths` clamps the minimums it is handed, so a column
        // that caps itself below its floor can't make this prediction overshoot and raise floors on a table that fits.
        const willScroll =
            measurements.reduce((total, measurement) => total + Math.min(minWidthFor(measurement, MIN_FREE_TEXT_COLUMN_WIDTH), measurement.maxWidth ?? Number.POSITIVE_INFINITY), 0) >
            availableWidth;

        const constraints: DynamicColumnConstraints[] = measurements.map((measurement) => ({
            contentWidth: measurement.contentWidth,
            minWidth: minWidthFor(measurement, willScroll ? SCROLLED_FREE_TEXT_COLUMN_WIDTH : MIN_FREE_TEXT_COLUMN_WIDTH),
            // Uncapped by default, so the table scrolls rather than truncating. A cap also can't be derived from the
            // available width without breaking the sizing: capping the free-text columns hands everything they give
            // up to whichever column is left uncapped, which is how `Role` ends up hundreds of pixels wide.
            maxWidth: measurement.maxWidth ?? Number.POSITIVE_INFINITY,
        }));

        const {widths, shouldScrollHorizontally} = calculateDynamicColumnWidths(constraints, availableWidth);
        // The columns fit equally, which is exactly what the static `1fr` tracks already do.
        if (widths.length === 0) {
            return noDynamicWidths;
        }

        // Keyed by column rather than tracked with a running index, so the tracks can be built without mutating a counter
        // from inside the mapping callback (which the React Compiler can't compile).
        const widthByColumnKey = new Map<ColumnKey, number>();
        for (const [index, column] of dynamicColumns.entries()) {
            widthByColumnKey.set(column.key, widths.at(index) ?? 0);
        }

        const gridTemplateColumns = columns.map((column) => (typeof column.width === 'number' ? `${column.width}px` : `${widthByColumnKey.get(column.key) ?? 0}px`));

        if (!shouldScrollHorizontally) {
            return {gridTemplateColumns, scrollWidth: undefined};
        }

        // The rows are wider than the table, so the caller scrolls them horizontally at exactly the width they need. This
        // adds back all of the row chrome subtracted above, margin included: the rows keep their horizontal margin inside
        // the scrolled content, so leaving it out would make the content container too narrow and clip the rows' trailing
        // edge at the end of the scroll.
        const scrollWidth = widths.reduce((total, width) => total + width, 0) + fixedColumnsWidth + selectionColumnWidth + totalGapWidth + rowChromeWidth;

        return {gridTemplateColumns, scrollWidth};
    }, [columns, data, tableWidth, isEnabled, hasSelectionColumn, styles.mh5.marginHorizontal, styles.ph3.paddingHorizontal, styles.gap3.gap, styles.ml1.marginLeft]);
}

export default useDynamicColumnWidths;
