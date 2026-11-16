/** Table of the groups with the highest count, with each group's share drawn as a bar, its count, its amount and, when comparing, how it changed. */
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

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import buildRankingTableRows from './buildRankingTableRows';
import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';
import InsightsRankingTableRow from './InsightsRankingTableRow';

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
        return <InsightsDataTableSkeleton fixedNumItems={rowLimit ?? CONST.SEARCH.TOP_SEARCH_LIMIT} />;
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
                        style={(index < rows.length - 1 || average !== undefined) && styles.borderBottom}
                    />
                ))}
                {!!formattedAverage && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, cardPadding]}>
                        <View style={[styles.insightsRankingTableAverageDashedLine, styles.insightsRankingTableAverageLegendMark]} />
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
    const columnCount = isComparingPreviousPeriod ? 5 : 4;

    return (
        <View
            style={cardPaddingBottom}
            {...getTableContainerAccessibilityProps(isTableSemanticsEnabled, title, rows.length, columnCount)}
        >
            <View
                style={[styles.flexRow, styles.gap5, cardPaddingHorizontal, styles.borderBottom]}
                {...getRowAccessibilityProps(isTableSemanticsEnabled, 0, true)}
            >
                <View
                    style={[styles.flex1, styles.mnw0]}
                    {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, 1)}
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
                    {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, 2)}
                >
                    <View style={styles.flex1}>
                        <SortableHeaderLabel
                            text={translate('insightsPage.share')}
                            isActive={false}
                            sortOrder={CONST.SEARCH.SORT_ORDER.DESC}
                            innerContainerStyle={headerLabelStyle}
                        />
                        {!!formattedAverage && averageWidthPercent !== undefined && (
                            <View style={[styles.insightsRankingTableAverageLineAnchor(averageWidthPercent), styles.pt2]}>
                                <View style={styles.insightsRankingTableAveragePill}>
                                    <Text
                                        variant="micro"
                                        style={[styles.noWrap, StyleUtils.getColorStyle(theme.textReversed)]}
                                    >
                                        {translate('insightsPage.compare.averageValue', formattedAverage)}
                                    </Text>
                                </View>
                                <View style={[styles.flex1, styles.insightsRankingTableAverageDashedLine]} />
                            </View>
                        )}
                    </View>
                </View>
                <View
                    style={styles.insightsRankingTableNumberColumn}
                    {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, true, true, CONST.SEARCH.SORT_ORDER.DESC, 3)}
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
                    {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, 4)}
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
                        {...getColumnHeaderAccessibilityProps(isTableSemanticsEnabled, false, false, undefined, 5)}
                    >
                        <SortableHeaderLabel
                            text={translate('insightsPage.percentChange')}
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
                        style={index < rows.length - 1 && styles.borderBottom}
                    />
                ))}
            </View>
        </View>
    );
}

export default InsightsRankingTable;
