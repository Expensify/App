import formatChartCount, {COUNT_COLUMN_TITLE_KEYS} from '@components/Charts/utils/formatChartCount';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import {getAverageLabelKey} from '@components/Search/buildChartSeries';
import {SortableHeaderLabel} from '@components/Search/SortableHeaderText';
import type {GroupedItem, SearchChartCountDimension, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import {
    getColumnHeaderAccessibilityProps,
    getRowAccessibilityProps,
    getRowGroupAccessibilityProps,
    getTableContainerAccessibilityProps,
    shouldUseTableSemantics,
} from '@components/Table/tableAccessibility';
import Text from '@components/Text';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import buildRankingTableRows from './buildRankingTableRows';
import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';
import InsightsRankingTableAverageLine from './InsightsRankingTableAverageLine';
import InsightsRankingTableAverageMarker from './InsightsRankingTableAverageMarker';
import InsightsRankingTableRow, {RANKING_TABLE_COLUMN} from './InsightsRankingTableRow';

const AVERAGE_FRACTION_DIGITS = 1;

type InsightsRankingTableProps = {
    /** Names the table to screen readers */
    title: string;

    /** The listed groups, sorted by count, most first */
    data: GroupedItem[];

    /** What the rows are grouped by, which names the first column and labels each row */
    groupBy: SearchGroupBy;

    /** What each group's count counts. Defaults to expenses. */
    countDimension?: SearchChartCountDimension;

    /** The most rows the table lists, which the loading skeleton shows */
    rowLimit?: number;

    comparison: ChartComparison | undefined;

    /** Whether the page compares against the previous period, which adds the change column */
    isComparingPreviousPeriod: boolean;

    /** The chart's query, which a pressed row opens on Spend */
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    isLoading?: boolean;
};

/** Table of the groups with the highest count, with each group's share drawn as a bar, its count, its amount and, when comparing, how it changed. */
function InsightsRankingTable({
    title,
    data,
    groupBy,
    countDimension = CONST.SEARCH.CHART_COUNT_DIMENSION.EXPENSE,
    rowLimit,
    comparison,
    isComparingPreviousPeriod,
    queryJSON,
    isLoading,
}: InsightsRankingTableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, numberFormat} = useLocalize();
    const {cardPadding, cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isLoading) {
        // The column headers: a label line, its padding and the divider below
        const headerHeight = variables.tableHeaderContentHeight + 2 * styles.pv2.paddingVertical + variables.borderTopWidth;
        // A narrow row: its padding, the name and count lines with the gap between, the gap above the bar, the bar and the divider
        const narrowRowHeight =
            2 * variables.tableRowPaddingVerticalCompact +
            variables.fontSizeNormalHeight +
            styles.gap1.gap +
            variables.lineHeightNormal +
            styles.gap3.gap +
            variables.insightsRankingTableBarHeight +
            variables.borderTopWidth;

        return (
            <View style={!shouldUseNarrowLayout && cardPaddingBottom}>
                <InsightsDataTableSkeleton
                    fixedNumItems={rowLimit ?? CONST.SEARCH.TOP_SEARCH_LIMIT}
                    shouldShowIndicator={false}
                    rowHeight={shouldUseNarrowLayout ? narrowRowHeight : variables.tableRowHeight}
                    topOffset={shouldUseNarrowLayout ? variables.borderTopWidth : headerHeight}
                />
            </View>
        );
    }

    const {rows, average, averageWidthPercent} = buildRankingTableRows({data, comparison, isComparingPreviousPeriod});
    if (rows.length === 0) {
        return null;
    }

    const formatCount = (count: number) => formatChartCount(count, countDimension, translate, numberFormat);

    const roundedAverage = average === undefined ? undefined : Math.round(average * 10 ** AVERAGE_FRACTION_DIGITS) / 10 ** AVERAGE_FRACTION_DIGITS;
    const formattedAverage = roundedAverage === undefined ? undefined : numberFormat(roundedAverage, {maximumFractionDigits: AVERAGE_FRACTION_DIGITS});

    if (shouldUseNarrowLayout) {
        return (
            <View style={styles.borderTop}>
                {rows.map((row, index) => (
                    <InsightsRankingTableRow
                        key={row.item.keyForList}
                        row={row}
                        groupBy={groupBy}
                        countDimension={countDimension}
                        queryJSON={queryJSON}
                        averageWidthPercent={averageWidthPercent}
                        rowIndex={index}
                    />
                ))}
                {!!formattedAverage && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.borderTop, cardPadding]}>
                        <InsightsRankingTableAverageMarker style={styles.insightsRankingTableAverageLegendMark} />
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                        >
                            {`${translate(getAverageLabelKey(groupBy))}: ${formatCount(roundedAverage ?? 0)}`}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowLayout);
    const headerLabelStyle = [styles.tableHeaderContentHeight, styles.pv2];
    const columnCount = isComparingPreviousPeriod ? RANKING_TABLE_COLUMN.CHANGE : RANKING_TABLE_COLUMN.AMOUNT;

    return (
        <View style={cardPaddingBottom}>
            <View
                style={styles.pRelative}
                {...getTableContainerAccessibilityProps(isTableSemanticsEnabled, title, rows.length, columnCount)}
            >
                <View
                    style={[styles.flexRow, styles.gap5, cardPaddingHorizontal, styles.borderBottom]}
                    {...getRowAccessibilityProps(isTableSemanticsEnabled, 0, true)}
                >
                    <View
                        style={[styles.flex1, styles.mnw0]}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, RANKING_TABLE_COLUMN.GROUP)}
                    >
                        <SortableHeaderLabel
                            text={translate(`search.filters.groupBy.${groupBy}`)}
                            isActive={false}
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                    </View>
                    <View
                        style={styles.insightsRankingTableShareColumn}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, RANKING_TABLE_COLUMN.SHARE)}
                    >
                        <View style={styles.flex1}>
                            <SortableHeaderLabel
                                text={translate('insightsPage.share')}
                                isActive={false}
                                sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                                innerContainerStyle={headerLabelStyle}
                            />
                        </View>
                    </View>
                    <View
                        style={styles.insightsRankingTableNumberColumn}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, true, true, CONST.SEARCH.SORT_ORDER.DESC, RANKING_TABLE_COLUMN.COUNT)}
                    >
                        <SortableHeaderLabel
                            text={translate(COUNT_COLUMN_TITLE_KEYS[countDimension])}
                            isActive
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                    </View>
                    <View
                        style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd]}
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, RANKING_TABLE_COLUMN.AMOUNT)}
                    >
                        <SortableHeaderLabel
                            text={translate('iou.amount')}
                            isActive={false}
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                    </View>
                    {isComparingPreviousPeriod && (
                        <View
                            style={styles.insightsRankingTableChangeColumn}
                            {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, RANKING_TABLE_COLUMN.CHANGE)}
                        >
                            <SortableHeaderLabel
                                text={translate('insightsPage.compare.percentChange')}
                                isActive={false}
                                sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                                innerContainerStyle={headerLabelStyle}
                            />
                        </View>
                    )}
                </View>
                <View {...getRowGroupAccessibilityProps(isTableSemanticsEnabled)}>
                    {rows.map((row, index) => (
                        <InsightsRankingTableRow
                            key={row.item.keyForList}
                            row={row}
                            groupBy={groupBy}
                            countDimension={countDimension}
                            queryJSON={queryJSON}
                            averageWidthPercent={averageWidthPercent}
                            rowIndex={index}
                        />
                    ))}
                </View>
                {!!formattedAverage &&
                    averageWidthPercent !== undefined && (
                        // Laid out like the rows, so one unbroken line runs over every bar at the average
                        <View style={[StyleSheet.absoluteFill, styles.flexRow, styles.gap5, cardPaddingHorizontal, styles.pointerEventsNone]}>
                            <View style={[styles.flex1, styles.mnw0]} />
                            <View style={styles.insightsRankingTableShareColumn}>
                                <View style={styles.flex1}>
                                    <View style={[styles.insightsRankingTableAverageLineAnchor(averageWidthPercent), styles.pt2]}>
                                        <View style={styles.insightsRankingTableAveragePill}>
                                            <Text
                                                variant="micro"
                                                style={[styles.noWrap, StyleUtils.getColorStyle(theme.textReversed)]}
                                            >
                                                {translate('insightsPage.compare.averageValue', formattedAverage)}
                                            </Text>
                                        </View>
                                        <InsightsRankingTableAverageLine style={styles.flex1} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.insightsRankingTableNumberColumn} />
                            <View style={styles.insightsRankingTableNumberColumn} />
                        </View>
                    )}
            </View>
        </View>
    );
}

export default InsightsRankingTable;
