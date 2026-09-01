import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchColumnMeasurementContext} from '@libs/getSearchColumnContentToMeasure';
import getSearchColumnContentToMeasure, {DYNAMICALLY_SIZED_SEARCH_COLUMNS, getSearchColumnExtraWidth, SEARCH_COLUMN_HEADER_TRANSLATION_KEYS} from '@libs/getSearchColumnContentToMeasure';
import measureTextWidth, {canMeasureText} from '@libs/measureTextWidth';
import createWidestTextMeasurer from '@libs/measureTextWidth/widestTextMeasurer';
import {isTransactionListItemType} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';

const {MIN_FREE_TEXT_COLUMN_WIDTH, MAX_FREE_TEXT_COLUMN_WIDTH} = CONST.TABLES.DYNAMIC_COLUMNS;

/** How a dynamically sized column shares the table's free space. */
type SearchColumnSizing = {
    /** The width the column's content wants, as a ratio against the other dynamic columns rather than a pixel width. */
    flexWeight: number;

    /** Width the column is never squeezed below, so its header stays readable however narrow the table gets. */
    minWidth: number;

    /**
     * Width the column's content actually wants, up to the cap. Once the table scrolls it is sized from these rather
     * than from the minimums, so a column that has the room stops truncating just because a narrower table would have
     * had to squeeze it.
     */
    contentWidth: number;
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

    const width = measureTextWidth(translate(translationKey), {fontSize: variables.fontSizeSmall, fontWeight: '700'});

    return width === null ? null : Math.ceil(width + sortIconWidth);
}

type UseSearchColumnWidthsParams = {
    /** Every column the table renders, in order. */
    columns: SearchColumnType[];

    /** The table's rows, all of them, so widths don't shift as rows scroll in. Non-transaction rows are skipped. */
    data: SearchListItem[];

    /** Whether dynamic sizing should run. Callers pass `false` on narrow layouts, where rows render as cards. */
    isEnabled: boolean;

    /** Data some columns need to resolve their text, read once at the list level rather than per row. */
    measurementContext?: SearchColumnMeasurementContext;
};

/**
 * Sizes the Search table's free-text columns from their content, instead of every one taking an equal share of what the
 * fixed columns leave over. Today that leaves a column of empty descriptions holding the same room as one of long
 * merchant names.
 *
 * Measured widths are applied as flex weights, not pixels. The fixed columns, gaps, and padding are spread across
 * several files, so computing "the space left over" here would duplicate those numbers and overflow the row the moment
 * the two drifted. As weights, the columns divide whatever is actually free and the row adds up by construction.
 *
 * Returns an empty map to leave the columns as they are: sizing is off, or text can't be measured (native).
 */
function useSearchColumnWidths({columns, data, isEnabled, measurementContext}: UseSearchColumnWidthsParams): Partial<Record<SearchColumnType, SearchColumnSizing>> {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const noColumnSizing: Partial<Record<SearchColumnType, SearchColumnSizing>> = {};

    // Checked before anything else, so native never walks the data to gather text that it can't measure anyway.
    if (!isEnabled || !canMeasureText()) {
        return noColumnSizing;
    }

    const dynamicColumns = columns.filter((column) => DYNAMICALLY_SIZED_SEARCH_COLUMNS.has(column));

    // With one dynamic column there is nothing to divide: it already takes whatever the fixed columns leave over.
    if (dynamicColumns.length < 2) {
        return noColumnSizing;
    }

    const contentWidths: Array<{column: SearchColumnType; contentWidth: number; headerLabelWidth: number}> = [];

    for (const column of dynamicColumns) {
        const measurer = createWidestTextMeasurer();

        for (const item of data) {
            if (!isTransactionListItemType(item)) {
                continue;
            }

            for (const content of getSearchColumnContentToMeasure(column, item, translate, measurementContext)) {
                measurer.add(content.text, content.font);
            }
        }

        const widestContentWidth = measurer.getWidestWidth();
        const headerLabelWidth = measureHeaderLabelWidth(column, translate, variables.iconSizeExtraSmall + styles.gap1.gap);

        if (widestContentWidth === null || headerLabelWidth === null) {
            return noColumnSizing;
        }

        const extraWidth = getSearchColumnExtraWidth(column);

        // The header counts as content, so a column of empty cells is sized by its heading instead of collapsing.
        // The result is capped because a column is sized by its single widest value: one long merchant name would
        // otherwise claim a share of the row proportional to itself and squeeze every other column. The cap bounds that
        // share only, so a table with room to spare still hands the surplus out rather than leaving it unused.
        const contentWidth = Math.min(Math.max(Math.ceil(widestContentWidth + extraWidth), headerLabelWidth), Math.max(MAX_FREE_TEXT_COLUMN_WIDTH + extraWidth, headerLabelWidth));

        contentWidths.push({column, contentWidth, headerLabelWidth});
    }

    // Normalized to average 1, so each dynamic column still grows by one unit overall, exactly as `flex: 1` did.
    // Other flexible columns grow by 1, so raw pixel weights here would be hundreds of units against their 1 and
    // would collapse them. Normalizing only changes how these columns split their own share.
    const averageContentWidth = contentWidths.reduce((total, {contentWidth}) => total + contentWidth, 0) / contentWidths.length;

    if (averageContentWidth <= 0) {
        return noColumnSizing;
    }

    const columnSizing: Partial<Record<SearchColumnType, SearchColumnSizing>> = {};

    for (const {column, contentWidth, headerLabelWidth} of contentWidths) {
        columnSizing[column] = {
            flexWeight: contentWidth / averageContentWidth,
            // Squeezed no further than a readable width, its own content if that is narrower, and never below the
            // header, which would leave the column unidentifiable. Once these no longer fit, the table scrolls.
            minWidth: Math.max(Math.min(contentWidth, MIN_FREE_TEXT_COLUMN_WIDTH + getSearchColumnExtraWidth(column)), headerLabelWidth),
            contentWidth,
        };
    }

    return columnSizing;
}

export default useSearchColumnWidths;
export type {SearchColumnSizing};
