/** Table of the groups with the highest count, with each group's share drawn as a bar, its count, its amount and, when comparing, how it changed. */
import formatChartCount, {COUNT_COLUMN_TITLE_KEYS} from '@components/Charts/utils/formatChartCount';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import {getAverageLabelKey} from '@components/Search/buildChartSeries';
import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {SortableHeaderLabel} from '@components/Search/SortableHeaderText';
import type {GroupedItem, SearchChartCountDimension, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import {
    getCellAccessibilityProps,
    getColumnHeaderAccessibilityProps,
    getRowAccessibilityProps,
    getRowGroupAccessibilityProps,
    getTableContainerAccessibilityProps,
    shouldUseTableSemantics,
} from '@components/Table/tableAccessibility';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import buildRankingTableRows from './buildRankingTableRows';
import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';
import InsightsRankingTableChange from './InsightsRankingTableChange';

/** The smallest share written as a number, in percentage points. A smaller one would round to 0.0%. */
const MIN_WRITTEN_SHARE = 0.1;

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
    const {convertToDisplayString} = useCurrencyListActions();
    const {cardPadding, cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];

    if (isLoading) {
        return <InsightsDataTableSkeleton fixedNumItems={rowLimit ?? CONST.SEARCH.TOP_SEARCH_LIMIT} />;
    }

    const {rows, average, averageWidthPercent} = buildRankingTableRows({data, comparison, isComparingPreviousPeriod});
    if (rows.length === 0) {
        return null;
    }

    const formatShare = (share: number) => {
        const percentOptions = {style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1} as const;
        if (share > 0 && share < MIN_WRITTEN_SHARE) {
            return `<${numberFormat(MIN_WRITTEN_SHARE / 100, percentOptions)}`;
        }
        return numberFormat(share / 100, percentOptions);
    };
    const formatCount = (count: number) => formatChartCount(count, countDimension, translate, numberFormat);

    const openOnSpend = (item: GroupedItem) => {
        if (!queryJSON) {
            return;
        }
        const query = buildChartDrillDownQuery(queryJSON, getFilterQuery(item));
        if (!query) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
    };

    const roundedAverage = average === undefined ? undefined : Math.round(average * 10 ** AVERAGE_FRACTION_DIGITS) / 10 ** AVERAGE_FRACTION_DIGITS;
    const formattedAverage = roundedAverage === undefined ? undefined : numberFormat(roundedAverage, {maximumFractionDigits: AVERAGE_FRACTION_DIGITS});

    if (shouldUseNarrowLayout) {
        return (
            <View style={styles.borderTop}>
                {rows.map(({item, share, barWidthPercent, change}, index) => {
                    const label = getLabel(item);
                    return (
                        <PressableWithFeedback
                            key={item.keyForList}
                            onPress={() => openOnSpend(item)}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={label}
                            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.TABLE_ROW}
                            style={[cardPaddingHorizontal, styles.tableRowVerticalPaddingCompact, styles.gap3, (index < rows.length - 1 || !!formattedAverage) && styles.borderBottom]}
                            hoverStyle={styles.hoveredComponentBG}
                        >
                            <View style={[styles.flexRow, styles.alignItemsStart, styles.gap3]}>
                                <View style={[styles.flex1, styles.mnw0, styles.gap1]}>
                                    <Text style={styles.breakWord}>{label}</Text>
                                    <Text
                                        variant="label"
                                        style={styles.textSupporting}
                                    >
                                        {[formatCount(item.count), formatShare(share)].join(` ${CONST.DOT_SEPARATOR} `)}
                                    </Text>
                                </View>
                                <View style={[styles.flexShrink0, styles.alignItemsEnd, styles.gap1]}>
                                    <Text>{convertToDisplayString(item.total, item.currency)}</Text>
                                    {!!change && <InsightsRankingTableChange change={change} />}
                                </View>
                            </View>
                            <View style={styles.insightsRankingTableBarTrack}>
                                <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                                {averageWidthPercent !== undefined && (
                                    <View style={styles.insightsRankingTableAverageLineAnchor(averageWidthPercent, variables.insightsRankingTableAverageMarkerOverhang)}>
                                        <View style={[styles.flex1, styles.insightsRankingTableAverageDashedLine]} />
                                    </View>
                                )}
                            </View>
                        </PressableWithFeedback>
                    );
                })}
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
    const cellStyle = [styles.tableRowVerticalPadding, styles.justifyContentCenter];
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
                {rows.map(({item, share, barWidthPercent, change}, index) => {
                    const label = getLabel(item);
                    return (
                        <PressableWithFeedback
                            key={item.keyForList}
                            onPress={() => openOnSpend(item)}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={label}
                            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.TABLE_ROW}
                            style={[styles.flexRow, styles.gap5, styles.tableRowHeight, cardPaddingHorizontal, index < rows.length - 1 && styles.borderBottom]}
                            hoverStyle={styles.hoveredComponentBG}
                            {...getRowAccessibilityProps(isTableSemanticsEnabled, index)}
                        >
                            {({hovered}) => (
                                <>
                                    <View
                                        style={[styles.flex1, styles.mnw0, cellStyle]}
                                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 1)}
                                    >
                                        <Text style={styles.breakWord}>{label}</Text>
                                    </View>
                                    <View
                                        style={styles.insightsRankingTableShareColumn}
                                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 2)}
                                    >
                                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                            <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                                            {averageWidthPercent !== undefined && (
                                                <View style={styles.insightsRankingTableAverageLineAnchor(averageWidthPercent)}>
                                                    <View style={[styles.flex1, styles.insightsRankingTableAverageDashedLine]} />
                                                </View>
                                            )}
                                            <Text
                                                variant="micro"
                                                style={[
                                                    styles.textSupporting,
                                                    styles.noWrap,
                                                    styles.ph2,
                                                    // Covers the average line where the two cross, so the percentage stays readable
                                                    averageWidthPercent !== undefined && StyleUtils.getBackgroundColorStyle(hovered ? theme.hoverComponentBG : theme.cardBG),
                                                ]}
                                            >
                                                {formatShare(share)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View
                                        style={[styles.insightsRankingTableNumberColumn, cellStyle]}
                                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 3)}
                                    >
                                        <Text>{numberFormat(item.count)}</Text>
                                    </View>
                                    <View
                                        style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd, cellStyle]}
                                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 4)}
                                    >
                                        <Text>{convertToDisplayString(item.total, item.currency)}</Text>
                                    </View>
                                    {!!change && (
                                        <View
                                            style={[styles.insightsRankingTableChangeColumn, cellStyle]}
                                            {...getCellAccessibilityProps(isTableSemanticsEnabled, 5)}
                                        >
                                            <InsightsRankingTableChange change={change} />
                                        </View>
                                    )}
                                </>
                            )}
                        </PressableWithFeedback>
                    );
                })}
            </View>
        </View>
    );
}

export default InsightsRankingTable;
