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

import {useMemo} from 'react';

const {MIN_FREE_TEXT_COLUMN_WIDTH, MAX_FREE_TEXT_COLUMN_WIDTH} = CONST.TABLES.DYNAMIC_COLUMNS;

/** How a dynamically sized column shares the table's free space. */
type SearchColumnSizing = {
    /**
     * The column's share of the free space, relative to the other dynamic columns. This is the width its content wants,
     * used as a ratio rather than an absolute width, so the columns always add up to exactly the space available.
     */
    flexWeight: number;

    /** Width the column is never squeezed below, so its header stays readable however narrow the table gets. */
    minWidth: number;

    /**
     * Width the column never grows past. Without it a table with room to spare would stretch these columns well beyond
     * anything they hold, since they are the only ones left that can take the slack.
     */
    maxWidth: number;
};

/**
 * Measures how wide a column's header renders, or `null` when the platform can't measure text.
 *
 * Measured in the bold weight the header takes while its column is sorted, and with room for the sort arrow reserved
 * whether or not the column is currently sorted, so sorting a column never truncates its own heading.
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

    /**
     * The table's rows. Sizing uses all of them, so the widths don't shift as rows scroll into view. Rows that aren't
     * transactions (group headers and the like) are skipped, since their cells don't line up with these columns.
     */
    data: SearchListItem[];

    /** Whether dynamic sizing should run. Callers pass `false` on narrow layouts, where rows render as cards. */
    isEnabled: boolean;

    /** Data some columns need to resolve their text, read once at the list level rather than per row. */
    measurementContext?: SearchColumnMeasurementContext;
};

/**
 * Sizes the Search table's free-text columns from their content instead of letting each take an equal share of whatever
 * the fixed columns leave over, which is what has a column of empty descriptions holding the same room as a column of
 * long merchant names.
 *
 * The measured widths are applied as flex weights rather than absolute widths. The table is a flex row whose fixed
 * columns, gaps, and padding are spread across several files, so anything that computed "the space left for the dynamic
 * columns" here would be a second copy of those numbers, and would overflow the row as soon as the two drifted apart.
 * As weights, the columns divide the space that is actually free in the proportions their content needs, and the row
 * adds up by construction.
 *
 * Returns an empty map when the columns should keep their current flex behavior: sizing is off, or text can't be
 * measured (native).
 */
function useSearchColumnWidths({columns, data, isEnabled, measurementContext}: UseSearchColumnWidthsParams): Partial<Record<SearchColumnType, SearchColumnSizing>> {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return useMemo(() => {
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

            // A column has to fit its header as well as its cells, so the header is part of what its content needs. A
            // column whose rows are all empty is then sized by its header alone rather than collapsing to nothing.
            //
            // The width its content asks for is capped, because a column is sized by its single widest value: one
            // unusually long merchant name across a hundred rows would otherwise set the column's width for all of them
            // and take the room the other columns need. Past the cap the column truncates, which costs the tail of one
            // outlying value rather than the width of every other column.
            const contentWidth = Math.min(Math.max(Math.ceil(widestContentWidth + extraWidth), headerLabelWidth), Math.max(MAX_FREE_TEXT_COLUMN_WIDTH + extraWidth, headerLabelWidth));

            contentWidths.push({column, contentWidth, headerLabelWidth});
        }

        // The weights are normalized to average 1, which keeps the dynamic columns' total flex grow at one unit each,
        // exactly what `flex: 1` gave them before. Columns outside this set (the amount column, say) also grow from a
        // zero basis, so raw pixel weights here would be hundreds of units against their 1 and would collapse them to
        // nothing. Normalizing changes only how these columns divide their share, and leaves every other column's.
        const averageContentWidth = contentWidths.reduce((total, {contentWidth}) => total + contentWidth, 0) / contentWidths.length;

        if (averageContentWidth <= 0) {
            return noColumnSizing;
        }

        const columnSizing: Partial<Record<SearchColumnType, SearchColumnSizing>> = {};

        for (const {column, contentWidth, headerLabelWidth} of contentWidths) {
            columnSizing[column] = {
                flexWeight: contentWidth / averageContentWidth,
                // Squeezed no further than a readable width, or its content when that is narrower, and never below its
                // header: a truncated heading leaves the column unidentifiable. Once these minimums no longer fit, the
                // table scrolls rather than squeezing further, which is what `getSearchTableMinWidth` below drives.
                minWidth: Math.max(Math.min(contentWidth, MIN_FREE_TEXT_COLUMN_WIDTH + getSearchColumnExtraWidth(column)), headerLabelWidth),
                maxWidth: contentWidth,
            };
        }

        return columnSizing;
    }, [columns, data, isEnabled, translate, measurementContext, styles.gap1.gap]);
}

export default useSearchColumnWidths;
export type {SearchColumnSizing};
