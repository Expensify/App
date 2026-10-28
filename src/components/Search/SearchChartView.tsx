import {BarChart, LineChart, PieChart} from '@components/Charts';
import type {ChartDataPoint, ChartValueFormatter} from '@components/Charts/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';
import {getDateFilterRange} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import type {ChartComparison, SearchChartModel} from './buildChartSeries';
import type {ChartView, GroupedItem, SearchChartMetric, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries} from './buildChartSeries';
import {buildChartDrillDownQuery} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import getInProgressBucketLabel from './getInProgressBucketLabel';
import applyRunningTotal from './runningTotal';
import {useSearchQueryContext} from './SearchContext';

/** What the chart hands to the details drawn below it, so they read the values the chart plotted */
type SearchChartDetails = SearchChartModel & {
    /** The metric the chart plotted */
    metric: SearchChartMetric;

    /** Formats a plotted value the way the chart labels it, left out while the chart labels amounts in each group's own currency */
    formatValue?: ChartValueFormatter;
};

type SearchChartViewProps = {
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    /** What the chart plots for each group: the money it totals, or how many expenses it holds. Defaults to the amount. */
    metric?: SearchChartMetric;

    isLoading?: boolean;

    /** Whether a bar chart labels its bars and a donut chart shows its legend. Line chart labels always show. */
    shouldShowGroupLabels?: boolean;

    /** Whether labels adapt to a constrained width: bar labels wrap to two centered lines and the donut legend uses the responsive side-by-side/stacked layout. Used by the Home widget. */
    shouldUseResponsiveLabels?: boolean;

    /** Whether pressing a bar, point or slice opens Search filtered to it */
    shouldDrillDownOnPress?: boolean;

    /** Whether a line chart with a single point is drawn as a bar */
    shouldShowSinglePointAsBar?: boolean;

    /** Rows the chart is compared against, drawn as a second series */
    comparison?: ChartComparison;

    /** Plots each point as the spend accumulated from the start of the range, instead of each period's own total. Applies to time-grouped line charts. */
    shouldShowRunningTotal?: boolean;

    /** Renders the details of the plotted groups below the chart */
    renderDetails?: (details: SearchChartDetails) => React.ReactNode;

    /** Style of the view around the chart, which the details below it don't share */
    chartContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({
    queryJSON,
    view,
    groupBy,
    data,
    metric = CONST.SEARCH.CHART_METRIC.AMOUNT,
    isLoading,
    shouldShowGroupLabels = true,
    shouldUseResponsiveLabels = false,
    shouldDrillDownOnPress = true,
    shouldShowSinglePointAsBar = false,
    comparison,
    shouldShowRunningTotal = false,
    renderDetails,
    chartContainerStyle,
}: SearchChartViewProps) {
    const theme = useTheme();
    const {preferredLocale, translate, dateFnsLocale, numberFormat} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getLineChartLabel, getFilterQuery, getDateRange, axisLabelSteps} = CHART_GROUP_BY_CONFIG[groupBy];

    const {data: chartData, comparison: chartComparison} = shouldShowRunningTotal ? applyRunningTotal({data, comparison, groupBy}) : {data, comparison};

    const today = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const dateFilterRange = queryJSON ? getDateFilterRange(queryJSON) : {};
    const isCountMetric = metric === CONST.SEARCH.CHART_METRIC.COUNT;

    // A count names what it counts, since nothing else in a tooltip or a donut's centre says the number is expenses rather than money.
    // Axis ticks take the bare number instead, to stay short, and `shouldUseWholeNumberTicks` keeps them off fractions of an expense.
    const formatCount: ChartValueFormatter = (value, options) =>
        options?.shouldUseCompactNotation ? numberFormat(value, {maximumFractionDigits: 0, notation: 'compact'}) : translate('iou.expenseCount', {count: value});
    const formatValue = isCountMetric ? formatCount : undefined;

    const {series, rows} = buildChartSeries({
        data: chartData,
        comparison: chartComparison,
        groupBy,
        view,
        metric,
        getLabel,
        getShortLabel: view === CONST.SEARCH.VIEW.LINE ? (getLineChartLabel ?? getShortLabel) : getShortLabel,
        getCurrencyDecimals,
        getInProgressLabel: (item) => getInProgressBucketLabel({groupBy, item, today, dateFnsLocale, dateFilterRange, translate}),
        isLaterPeriod: (item) => {
            const range = getDateRange?.(item);
            if (!range) {
                return false;
            }

            // A date filter that starts partway through a group starts the group there too, e.g. Oct 10 for a range from Oct 10 to Dec 31
            const start = dateFilterRange.start && dateFilterRange.start > range.start ? dateFilterRange.start : range.start;
            return start > today;
        },
        translate,
        dateFnsLocale,
        colorScheme: theme.colorScheme,
    });
    const points = rows.map((row) => row.point);

    // On narrow layout, a single step spanning the whole axis labels only the first and last points
    const labelSteps = shouldUseNarrowLayout && axisLabelSteps ? [Math.max(1, points.length - 1)] : axisLabelSteps;

    const handleItemPress = (dataPoint: ChartDataPoint, index: number) => {
        const item = rows.at(index)?.item;
        if (!item || !queryJSON) {
            return;
        }

        const query = buildChartDrillDownQuery(queryJSON, getFilterQuery(item));

        if (!query) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey: currentSearchKey}));
    };

    const onItemPress = shouldDrillDownOnPress ? handleItemPress : undefined;

    const firstItem = data.at(0);
    const currency = sanitizeCurrencyCode(firstItem?.currency ?? CONST.CURRENCY.USD);
    const parts = formatToParts(preferredLocale, 0, {style: 'currency', currency});
    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');
    const intlSymbol = parts.find((p) => p.type === 'currency')?.value;
    const unit = isCountMetric ? undefined : {value: getCurrencySymbol(currency) ?? intlSymbol ?? currency, fallback: intlSymbol ?? currency};
    const unitPosition = currencyIndex < integerIndex ? 'left' : 'right';

    const CHART_VIEW_TO_CHART: Record<ChartView, React.ReactNode> = {
        [CONST.SEARCH.VIEW.BAR]: (
            <BarChart
                data={points}
                series={series}
                isLoading={isLoading}
                onBarPress={onItemPress}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
                formatValue={formatValue}
                shouldUseWholeNumberTicks={isCountMetric}
                shouldShowLabels={shouldShowGroupLabels}
                shouldWrapLabels={shouldUseResponsiveLabels}
            />
        ),
        [CONST.SEARCH.VIEW.LINE]:
            shouldShowSinglePointAsBar && points.length === 1 ? (
                <BarChart
                    data={points}
                    series={series}
                    isLoading={isLoading}
                    onBarPress={onItemPress}
                    yAxisUnit={unit}
                    yAxisUnitPosition={unitPosition}
                    formatValue={formatValue}
                    shouldUseWholeNumberTicks={isCountMetric}
                />
            ) : (
                <LineChart
                    data={points}
                    series={series}
                    isLoading={isLoading}
                    onPointPress={onItemPress}
                    labelSteps={labelSteps}
                    yAxisUnit={unit}
                    yAxisUnitPosition={unitPosition}
                    formatValue={formatValue}
                    shouldUseWholeNumberTicks={isCountMetric}
                />
            ),
        [CONST.SEARCH.VIEW.PIE]: (
            <PieChart
                data={points}
                series={series}
                isLoading={isLoading}
                onSlicePress={onItemPress}
                valueUnit={unit?.value}
                valueUnitPosition={unitPosition}
                formatValue={formatValue}
                shouldShowLegend={shouldShowGroupLabels}
                shouldUseResponsiveLegend={shouldUseResponsiveLabels}
            />
        ),
    };

    return (
        <>
            <View style={chartContainerStyle}>{CHART_VIEW_TO_CHART[view]}</View>
            {renderDetails?.({series, rows, metric, formatValue})}
        </>
    );
}

export default SearchChartView;
