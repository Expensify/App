import {BarChart, LineChart, PieChart} from '@components/Charts';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {ChartComparison, SearchChartModel} from './buildChartSeries';
import type {ChartBucketRange} from './chartGroupByConfig';
import type {ChartView, GroupedItem, SearchChartDataRow, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries, CHART_SERIES_KEY, getCounterpartBucketRange} from './buildChartSeries';
import {buildChartDrillDownQuery, getBucketDrillDownRange} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {useSearchQueryContext} from './SearchContext';

type SearchChartViewProps = {
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    isLoading?: boolean;

    /** Color every bar is drawn in. Only a bar chart reads it. */
    color?: string;

    /** The period drawn beside `data` as a second series, left out when nothing is compared */
    comparison?: ChartComparison;

    /** Renders the details of the plotted groups below the chart */
    renderDetails?: (model: SearchChartModel) => React.ReactNode;

    /** Style of the view around the chart, which the details below it don't share */
    chartContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, isLoading, color, comparison, renderDetails, chartContainerStyle}: SearchChartViewProps) {
    const {preferredLocale, translate, dateFnsLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getFilterQuery, getBucketRange, bucketUnit} = CHART_GROUP_BY_CONFIG[groupBy];

    const model = buildChartSeries({
        rows: data,
        color,
        comparison,
        view,
        groupBy,
        getLabel,
        getShortLabel,
        getCurrencyDecimals,
        translate,
        dateFnsLocale,
    });
    const {series, rows} = model;
    const points = rows.map((row) => row.point);

    /** A compared bucket with no expenses has no row of its own, so its dates are worked out from its position */
    const getPressedBucketRange = (row: SearchChartDataRow, isComparisonSeries: boolean): ChartBucketRange => {
        const bucketRange = getBucketRange?.(row.item) ?? {start: '', end: ''};
        if (!isComparisonSeries) {
            return bucketRange;
        }
        if (row.comparisonItem) {
            return getBucketRange?.(row.comparisonItem) ?? bucketRange;
        }
        return comparison && bucketUnit ? getCounterpartBucketRange(bucketRange, comparison.primaryPeriod.range.start, comparison.comparisonPeriod.range.start, bucketUnit) : bucketRange;
    };

    const handleItemPress = (index: number, seriesKey: string) => {
        const row = rows.at(index);
        if (!row || !queryJSON) {
            return;
        }

        const isComparisonSeries = seriesKey === CHART_SERIES_KEY.COMPARISON;
        const pressedPeriod = isComparisonSeries ? comparison?.comparisonPeriod : comparison?.primaryPeriod;
        const pressedItem = (isComparisonSeries ? row.comparisonItem : row.item) ?? row.item;
        // A time bucket opens the dates it covers; a ranking group opens its own rows over the period its series plots.
        const dateRange = getBucketRange ? getBucketDrillDownRange(queryJSON, getPressedBucketRange(row, isComparisonSeries), pressedPeriod?.range) : pressedPeriod?.range;
        const query = buildChartDrillDownQuery(queryJSON, {groupFilter: getBucketRange ? undefined : getFilterQuery(pressedItem), dateRange});

        if (!query) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey: currentSearchKey}));
    };

    const firstItem = data.at(0);
    const currency = sanitizeCurrencyCode(firstItem?.currency ?? CONST.CURRENCY.USD);
    const parts = formatToParts(preferredLocale, 0, {style: 'currency', currency});
    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');
    const intlSymbol = parts.find((p) => p.type === 'currency')?.value;
    const unit = {value: getCurrencySymbol(currency) ?? intlSymbol ?? currency, fallback: intlSymbol ?? currency};
    const unitPosition = currencyIndex < integerIndex ? 'left' : 'right';

    const CHART_VIEW_TO_CHART: Record<ChartView, React.ReactNode> = {
        [CONST.SEARCH.VIEW.BAR]: (
            <BarChart
                data={points}
                series={series}
                isLoading={isLoading}
                onBarPress={(dataPoint, index, seriesKey) => handleItemPress(index, seriesKey)}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
                color={color}
            />
        ),
        [CONST.SEARCH.VIEW.LINE]: (
            <LineChart
                data={points}
                series={series}
                isLoading={isLoading}
                onPointPress={(dataPoint, index, seriesKey) => handleItemPress(index, seriesKey)}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
            />
        ),
        [CONST.SEARCH.VIEW.PIE]: (
            <PieChart
                data={points}
                series={series}
                isLoading={isLoading}
                onSlicePress={(dataPoint, index) => handleItemPress(index, CHART_SERIES_KEY.PRIMARY)}
                valueUnit={unit.value}
                valueUnitPosition={unitPosition}
                shouldShowLegend={!renderDetails}
            />
        ),
    };

    return (
        <>
            <View style={chartContainerStyle}>{CHART_VIEW_TO_CHART[view]}</View>
            {renderDetails?.(model)}
        </>
    );
}

export default SearchChartView;
