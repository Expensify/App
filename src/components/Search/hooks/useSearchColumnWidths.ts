import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';
import type {DynamicColumnConstraints} from '@components/Table/calculateDynamicColumnWidths';
import calculateDynamicColumnWidths, {distributeEqualWidths} from '@components/Table/calculateDynamicColumnWidths';
import type {PersistedColumnLayout} from '@components/Table/columnResize/getPersistedColumnLayout';
import getPersistedColumnLayout from '@components/Table/columnResize/getPersistedColumnLayout';
import {getAvailableColumnsWidth} from '@components/Table/columnResize/getResizableColumnLayout';
import type {ResizableColumn} from '@components/Table/columnResize/resolveDraggedColumnWidths';
import {isColumnResizable} from '@components/Table/columnResize/resolveDraggedColumnWidths';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchColumnMeasurementContext} from '@libs/getSearchColumnContentToMeasure';
import getSearchColumnContentToMeasure, {
    DYNAMICALLY_SIZED_SEARCH_COLUMNS,
    getSearchColumnEditButtonReserve,
    getSearchColumnExtraWidth,
    HUGGED_SEARCH_COLUMNS,
    SEARCH_COLUMN_HEADER_TRANSLATION_KEYS,
} from '@libs/getSearchColumnContentToMeasure';
import measureTextWidth, {canMeasureText} from '@libs/measureTextWidth';
import createWidestTextMeasurer from '@libs/measureTextWidth/widestTextMeasurer';
import {getSearchTableRowChromeWidths, getSearchTableRowInsetWidth} from '@libs/SearchUIUtils';

import {textVariants} from '@styles/typography';
import type {GetReportTableColumnStylesParams} from '@styles/utils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

const {MIN_FREE_TEXT_COLUMN_WIDTH, MAX_FREE_TEXT_COLUMN_WIDTH} = CONST.TABLES.DYNAMIC_COLUMNS;

/** How wide a dynamically sized column was resolved to, and how far it may be squeezed before the table scrolls. */
type SearchColumnSizing = {
    /**
     * The width the column is laid out at, or `undefined` when every column fits an equal share and they all stay
     * equal, which is what the columns are already styled to do.
     */
    width: number | undefined;

    /** Width the column is never squeezed below, so its header stays readable however narrow the table gets. */
    minWidth: number;

    /** Width the column's content wants, used to lay the columns out once the table has given up on fitting them. */
    contentWidth: number;

    /** Whether the column is sized to its content exactly, rather than sharing the row's spare space with the others. */
    shouldHug: boolean;
};

/**
 * Measures how wide a column's header renders, or `null` when the platform can't measure text.
 *
 * Uses the bold weight and reserves the sort arrow even when unsorted, so sorting a column never truncates its heading.
 */
function measureHeaderLabelWidth(column: SearchColumnType, translate: LocalizedTranslate, sortIconWidth: number): number | null {
    const translationKey = SEARCH_COLUMN_HEADER_TRANSLATION_KEYS[column];

    if (!translationKey) {
        return 0;
    }

    // The heading's own variant, so the measurement follows the typography scale rather than a copy of it.
    const width = measureTextWidth(translate(translationKey), {fontSize: textVariants.microStrong.fontSize, fontWeight: '700'});

    return width === null ? null : Math.ceil(width + sortIconWidth);
}

type UseSearchColumnWidthsParams = {
    /** Every column the table renders, in order. */
    columns: SearchColumnType[];

    /** The table's rows, all of them, so widths don't shift as rows scroll in. A row of a kind the table can't read
     * text from measures as empty and leaves its columns on their existing widths. */
    data: SearchListItem[];

    /** Measured width of the area the table renders into, including the rows' own margin and padding. */
    tableWidth: number;

    /** Whether dynamic sizing should run. Callers pass `false` on narrow layouts, where rows render as cards. */
    isEnabled: boolean;

    /** Which columns render in their wider variant, so the fixed columns are subtracted at the width they really take. */
    columnSizeOptions?: GetReportTableColumnStylesParams;

    /** Data some columns need to resolve their text, read once at the list level rather than per row. */
    measurementContext?: SearchColumnMeasurementContext;

    /** When on, every column is pinned to a px width read from a CSS custom property. */
    isColumnResizingEnabled: boolean;

    /** `undefined` until the first drag. After it, content no longer sizes the columns. */
    storedTableColumnWidths: StoredTableColumnWidths | undefined;
};

type SearchColumnWidthsResult = {
    /** Empty to leave the columns as they are styled. */
    columnWidths: Partial<Record<SearchColumnType, SearchColumnSizing>>;

    /** `undefined` unless resizing is enabled and some column resizes. */
    resizableLayout: PersistedColumnLayout | undefined;
};

/**
 * Sizes the Search table's free-text columns from their content, instead of every one taking an equal share of what the
 * fixed columns leave over. Today that leaves a column of empty descriptions holding the same room as one of long
 * merchant names.
 *
 * The widths come from `calculateDynamicColumnWidths`, the same resolver the Members table uses, so every dynamically
 * sized table in the app behaves identically: equal columns while everything fits, then a column that can't fit an
 * equal share taking exactly its content while the rest split the remainder equally, then a squeeze toward the
 * minimums, and only then a scroll. The per-table part is what to measure and what each column's minimum is.
 *
 * Returns an empty map to leave the columns as they are: sizing is off, text can't be measured (native), or the table
 * hasn't been measured yet.
 *
 * With resizing on, it also lays the columns out like a resizable `Table`, replaying the saved widths after the first drag.
 */
function useSearchColumnWidths({
    columns,
    data,
    tableWidth,
    isEnabled,
    columnSizeOptions,
    measurementContext,
    isColumnResizingEnabled,
    storedTableColumnWidths,
}: UseSearchColumnWidthsParams): SearchColumnWidthsResult {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const noColumnSizing: SearchColumnWidthsResult = {columnWidths: {}, resizableLayout: undefined};

    // Checked before anything else, so native never walks the data to gather text that it can't measure anyway.
    if (!isEnabled || tableWidth <= 0 || !canMeasureText()) {
        return noColumnSizing;
    }

    const dynamicColumns = columns.filter((column) => DYNAMICALLY_SIZED_SEARCH_COLUMNS.has(column));

    if (dynamicColumns.length === 0) {
        return noColumnSizing;
    }

    let fixedColumnsWidth = 0;
    const declaredColumnWidths = new Map<SearchColumnType, number>();

    for (const column of columns) {
        if (DYNAMICALLY_SIZED_SEARCH_COLUMNS.has(column)) {
            continue;
        }

        const declaredWidth = StyleUtils.getReportTableColumnStyles(column, columnSizeOptions ?? {}).width;

        // A column styled with flex alone declares no width, so it can't be subtracted from the budget and the whole
        // table keeps its existing layout rather than being sized from a budget that is wrong.
        if (typeof declaredWidth !== 'number') {
            return noColumnSizing;
        }

        fixedColumnsWidth += declaredWidth;
        declaredColumnWidths.set(column, declaredWidth);
    }

    // What the dynamic columns share: the table, less what the row spends on anything that is not a column, less the
    // columns pinned to a width of their own. The inset comes from the same helper the horizontal scroller subtracts,
    // so the two cannot disagree about whether the columns fit.
    //
    // It does not have to be exact. The resolved widths are applied as a flex basis that still grows and shrinks, so an
    // inset a few px out shows as the columns sharing a little more or less room rather than as dead space at the end
    // of the row. What it does decide is which of the four states the table is in, and "close" is enough for that.
    // A table showing enough fixed columns to overrun its own width leaves this at zero or less. That is the scrolling
    // case rather than a reason to stop: the columns are still measured, and each one is sized to its content so an
    // empty column stays narrow instead of claiming an equal share of a budget that does not exist.
    const availableWidth = tableWidth - getSearchTableRowInsetWidth(columns.length) - fixedColumnsWidth;

    const constraints: DynamicColumnConstraints[] = [];
    const contentWidths: number[] = [];

    // A measurer per column, filled in one pass over the rows rather than one pass per column, so the row array is
    // walked once however many columns the table shows.
    const measurersByColumn = new Map(dynamicColumns.map((column) => [column, createWidestTextMeasurer()]));

    for (const item of data) {
        for (const [column, measurer] of measurersByColumn) {
            for (const content of getSearchColumnContentToMeasure(column, item, translate, measurementContext)) {
                measurer.add(content.text, content.font);
            }
        }
    }

    for (const [column, measurer] of measurersByColumn) {
        const widestContentWidth = measurer.getWidestWidth();
        const headerLabelWidth = measureHeaderLabelWidth(column, translate, variables.iconSizeExtraSmall + styles.gap1.gap);

        if (widestContentWidth === null || headerLabelWidth === null) {
            return noColumnSizing;
        }

        // A short value in an editable cell sits under the edit button that appears on hover, so it is the one case
        // where the button has to be reserved for. Measured from the text alone, before the cell's own padding, since
        // that padding is what the value is inset by rather than room it has to spare.
        const extraWidth = getSearchColumnExtraWidth(column) + getSearchColumnEditButtonReserve(column, widestContentWidth);

        // A column has to fit its header as well as its cells, so the heading is part of what its content needs rather
        // than a separate floor. That also keeps a column of empty cells identifiable instead of collapsing.
        const contentWidth = Math.max(Math.ceil(widestContentWidth + extraWidth), headerLabelWidth);

        contentWidths.push(contentWidth);

        // A column holding a fixed-size element is pinned to its content: it takes no share of the spare room and is
        // never squeezed, so its three constraints are the same number and the resolver settles it there immediately.
        if (HUGGED_SEARCH_COLUMNS.has(column)) {
            constraints.push({contentWidth, minWidth: contentWidth, maxWidth: contentWidth});
            continue;
        }

        constraints.push({
            contentWidth,
            // Squeezed no further than a readable width, or its own content when that is narrower, so a short value
            // isn't inflated to the minimum. Never below the header, which would leave the column unidentifiable.
            minWidth: Math.max(Math.min(contentWidth, MIN_FREE_TEXT_COLUMN_WIDTH + extraWidth), headerLabelWidth),
            // Uncapped while the table still fits, so a long value gets the room when the room is there instead of
            // stopping at a cap and leaving the space unused. Capping is only for the scrolling case below.
            maxWidth: Number.POSITIVE_INFINITY,
        });
    }

    const {widths, shouldScrollHorizontally} = calculateDynamicColumnWidths(constraints, availableWidth);

    const columnSizing: Partial<Record<SearchColumnType, SearchColumnSizing>> = {};

    for (const [index, column] of dynamicColumns.entries()) {
        const constraint = constraints.at(index);
        const contentWidth = contentWidths.at(index) ?? 0;

        if (!constraint) {
            continue;
        }

        const shouldHug = HUGGED_SEARCH_COLUMNS.has(column);

        // Past the point where the columns fit, a column is sized to its content but no wider than the cap: the table
        // scrolls either way, and letting one unusually long value set the width would push every column after it out
        // of view for the sake of a single row. Below the cap nothing is capped at all, which is why this is applied
        // here rather than as the constraint the resolver sees.
        const scrolledWidth = shouldHug ? contentWidth : Math.max(Math.min(contentWidth, MAX_FREE_TEXT_COLUMN_WIDTH + getSearchColumnExtraWidth(column)), constraint.minWidth);

        columnSizing[column] = {
            shouldHug,
            minWidth: constraint.minWidth,
            contentWidth: shouldScrollHorizontally ? scrolledWidth : contentWidth,
            // An empty result means every column fits an equal share, so they are left to divide the row equally, which
            // is state one of the model and exactly what the columns are already styled to do.
            width: shouldScrollHorizontally ? scrolledWidth : widths.at(index),
        };
    }

    if (!isColumnResizingEnabled) {
        return {columnWidths: columnSizing, resizableLayout: undefined};
    }

    const rowChromeWidths = getSearchTableRowChromeWidths(columns.length);

    // Fixed and hugged columns are pinned and passed headless, since the leftover room goes to the last headed column
    // and it should land on a free-text one rather than a date or a badge. Their real headers still render.
    const resizableColumns: ResizableColumn[] = columns.map((column) => {
        const sizing = columnSizing[column];

        if (!sizing || sizing.shouldHug) {
            const pinnedWidth = sizing?.contentWidth ?? declaredColumnWidths.get(column) ?? 0;

            return {key: column, label: '', declaredWidth: pinnedWidth, contentWidth: pinnedWidth, minWidth: pinnedWidth, maxWidth: pinnedWidth};
        }

        return {
            key: column,
            label: column,
            declaredWidth: undefined,
            // Uncapped, unlike the scrolled width, so a fit shows the whole value.
            contentWidth: contentWidths.at(dynamicColumns.indexOf(column)) ?? 0,
            minWidth: sizing.minWidth,
            maxWidth: Number.POSITIVE_INFINITY,
        };
    });

    if (!resizableColumns.some(isColumnResizable)) {
        return {columnWidths: columnSizing, resizableLayout: undefined};
    }

    const pinnedColumnsWidth = resizableColumns.reduce((total, column) => total + (column.declaredWidth ?? 0), 0);
    const freeTextColumnCount = resizableColumns.filter((column) => column.declaredWidth === undefined).length;
    // Columns left to share the row equally get equal whole px, which is what their flex growth gives them unpinned.
    const equalWidths = distributeEqualWidths(freeTextColumnCount, getAvailableColumnsWidth(tableWidth, rowChromeWidths) - pinnedColumnsWidth);

    const defaultColumnWidths: Record<string, number> = {};
    let freeTextColumnIndex = 0;

    for (const [index, column] of columns.entries()) {
        const declaredWidth = resizableColumns.at(index)?.declaredWidth;

        if (declaredWidth !== undefined) {
            defaultColumnWidths[column] = declaredWidth;
            continue;
        }

        const resolvedWidth = columnSizing[column]?.width;

        // Floored to whole px. The leftover fraction goes to the last free-text column.
        defaultColumnWidths[column] = resolvedWidth === undefined ? (equalWidths.at(freeTextColumnIndex) ?? 0) : Math.floor(resolvedWidth);
        freeTextColumnIndex += 1;
    }

    return {
        columnWidths: columnSizing,
        resizableLayout: getPersistedColumnLayout({
            columns: resizableColumns,
            freshColumnWidths: defaultColumnWidths,
            defaultColumnWidths,
            storedTableColumnWidths,
            tableWidth,
            rowChromeWidths,
        }),
    };
}

export default useSearchColumnWidths;
export type {SearchColumnSizing};
