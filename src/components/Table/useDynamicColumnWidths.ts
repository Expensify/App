import measureTextWidth from '@libs/measureTextWidth';

import variables from '@styles/variables';

import {useMemo} from 'react';

import type {DynamicColumnConstraints} from './calculateDynamicColumnWidths';
import type {TableColumn, TableData} from './types';

import calculateDynamicColumnWidths from './calculateDynamicColumnWidths';

/** Horizontal margin on the header row and every data row (`styles.mh5`). */
const ROW_HORIZONTAL_MARGIN = 20;

/** Horizontal padding inside the header row and every data row on wide layouts (`styles.ph3`). */
const ROW_HORIZONTAL_PADDING = 12;

/** Gap between columns (`styles.gap3`). */
const COLUMN_GAP = 12;

/** Width the sort arrow adds to a header label (`variables.iconSizeExtraSmall` plus `styles.ml1`). */
const SORT_ICON_WIDTH = variables.iconSizeExtraSmall + 4;

/**
 * How many of the longest candidate strings are measured per column. Character count is a good but imperfect proxy for
 * rendered width in a proportional font, so the longest few are all measured and the widest of them wins.
 */
const MEASURED_CANDIDATES_PER_COLUMN = 5;

/**
 * How narrow a column with long content may get before it stops shrinking. Without this a column's floor is just its
 * header label, so a column holding long values could shrink to a sliver that shows only a few characters. Columns whose
 * content is already narrower than this keep being sized by their content, so it never pads a short column.
 */
const MIN_CONTENT_COLUMN_WIDTH = 160;

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

    // Text is grouped by font, because the same string renders wider in a larger or bolder font, so the longest string
    // overall isn't necessarily the widest one.
    const textsByFont = new Map<string, {fontSize?: number; fontWeight?: string; texts: string[]}>();

    for (const item of data) {
        for (const content of dynamicSizing.getContentToMeasure(item)) {
            if (!content.text) {
                continue;
            }

            const fontKey = `${content.fontSize ?? ''}|${content.fontWeight ?? ''}`;
            const existingTexts = textsByFont.get(fontKey);

            if (existingTexts) {
                existingTexts.texts.push(content.text);
            } else {
                textsByFont.set(fontKey, {fontSize: content.fontSize, fontWeight: content.fontWeight, texts: [content.text]});
            }
        }
    }

    let widestContentWidth = 0;

    for (const {fontSize, fontWeight, texts} of textsByFont.values()) {
        // Only the widest string can decide the column's width, and character count is a good (if imperfect) proxy for
        // rendered width, so just the longest few strings are measured.
        const candidates = [...texts].sort((first, second) => second.length - first.length).slice(0, MEASURED_CANDIDATES_PER_COLUMN);

        for (const text of candidates) {
            const width = measureTextWidth(text, {fontSize, fontWeight});

            if (width === null) {
                return null;
            }

            widestContentWidth = Math.max(widestContentWidth, width);
        }
    }

    return widestContentWidth === 0 ? 0 : widestContentWidth + (dynamicSizing.extraWidth ?? 0);
}

/**
 * Measures how wide a column's header label renders, or `null` when the platform can't measure text. The label is
 * measured in the bold font the header uses while the column is sorted, so sorting a column never truncates its label.
 */
function measureHeaderLabelWidth(label: string): number | null {
    const width = measureTextWidth(label, {fontSize: variables.fontSizeSmall, fontWeight: '700'});

    if (width === null) {
        return null;
    }

    return width === 0 ? 0 : width + SORT_ICON_WIDTH;
}

/**
 * Resolves the CSS grid tracks for a table whose columns are sized from their content.
 *
 * The tracks have to be identical for the header and every data row, because each row is its own grid: a content-based
 * CSS track (`max-content`) would resolve per row, leaving the columns out of line. So the widths are measured once and
 * shared, and the result is a plain track list the header and rows both render.
 *
 * Returns `undefined` when dynamic sizing doesn't apply — it isn't enabled, the table hasn't been measured yet, text
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
    return useMemo(() => {
        const noDynamicWidths = {gridTemplateColumns: undefined, scrollWidth: undefined};

        if (!isEnabled || tableWidth <= 0) {
            return noDynamicWidths;
        }

        // A column with a percentage or other non-numeric width can't be subtracted from the budget, so the whole table
        // keeps its static tracks rather than being laid out from a wrong budget.
        if (columns.some((column) => column.width !== undefined && typeof column.width !== 'number')) {
            return noDynamicWidths;
        }

        const fixedColumns = columns.filter((column): column is TableColumn<ColumnKey, DataType> & {width: number} => typeof column.width === 'number');
        const dynamicColumns = columns.filter((column) => typeof column.width !== 'number');

        if (dynamicColumns.length === 0) {
            return noDynamicWidths;
        }

        const selectionColumnWidth = hasSelectionColumn ? variables.tableCheckboxColumnWidth : 0;
        const totalColumnCount = columns.length + (hasSelectionColumn ? 1 : 0);
        const totalGapWidth = Math.max(totalColumnCount - 1, 0) * COLUMN_GAP;
        const fixedColumnsWidth = fixedColumns.reduce((total, column) => total + column.width, 0);
        const rowChromeWidth = (ROW_HORIZONTAL_MARGIN + ROW_HORIZONTAL_PADDING) * 2;
        const availableWidth = tableWidth - rowChromeWidth - totalGapWidth - fixedColumnsWidth - selectionColumnWidth;

        if (availableWidth <= 0) {
            return noDynamicWidths;
        }

        const constraints: DynamicColumnConstraints[] = [];

        for (const column of dynamicColumns) {
            const contentWidth = measureColumnContentWidth(column, data);
            const headerLabelWidth = measureHeaderLabelWidth(column.label);

            // Text measurement is unavailable (native), so the table keeps its static, content-independent tracks.
            if (contentWidth === null || headerLabelWidth === null) {
                return noDynamicWidths;
            }

            constraints.push({
                contentWidth,
                // A column never shrinks below its header label, and a column with long content stops at a width where
                // that content is still readable. `Math.min` keeps the readable floor from inflating a column whose
                // content is already narrower than it.
                minWidth: column.dynamicSizing?.minWidth ?? Math.max(headerLabelWidth, Math.min(contentWidth, MIN_CONTENT_COLUMN_WIDTH)),
                // Uncapped by default. A cap can't be derived from the available width without breaking the sizing: a
                // column capped at its equal share looks like it fits in one, so the columns would be left equal and the
                // long column would stay truncated. Columns that genuinely need a ceiling set `maxWidth` themselves.
                maxWidth: column.dynamicSizing?.maxWidth ?? Number.POSITIVE_INFINITY,
            });
        }

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
    }, [columns, data, tableWidth, isEnabled, hasSelectionColumn]);
}

export default useDynamicColumnWidths;
