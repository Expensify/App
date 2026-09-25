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

import type {SearchChartModel} from './buildChartSeries';
import type {ChartBucketRange} from './chartGroupByConfig';
import type {ChartView, GroupedItem, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries, CHART_SERIES_KEY} from './buildChartSeries';
import {buildChartDrillDownQuery} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {useSearchQueryContext} from './SearchContext';

/** How one of the compared periods is named, colored and bounded */
type SearchChartWindow = {
    /** Name shown in the legend and the tooltip */
    label: string;

    color: string;

    /** The dates the period covers, which a drill-down into one of its ranking bars narrows to */
    range: ChartBucketRange;
};

type SearchChartComparison = {
    /** The compared period's grouped rows, paired to the plotted ones */
    data: GroupedItem[];

    /** The period `data` was plotted from */
    current: SearchChartWindow;

    /** The period drawn beside it */
    previous: SearchChartWindow;
};

type SearchChartViewProps = {
    queryJSON: Readonly<SearchQueryJSON>;

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
    comparison?: SearchChartComparison;

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
    const {preferredLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getFilterQuery, getBucketRange} = CHART_GROUP_BY_CONFIG[groupBy];

    const model = buildChartSeries({
        primary: {rows: data, label: comparison?.current.label, color: comparison?.current.color ?? color, start: comparison?.current.range.start},
        comparison: comparison ? {rows: comparison.data, label: comparison.previous.label, color: comparison.previous.color, start: comparison.previous.range.start} : undefined,
        view,
        groupBy,
        getLabel,
        getShortLabel,
        getCurrencyDecimals,
    });
    const {series, rows} = model;
    const points = rows.map((row) => row.point);

    const handleItemPress = (index: number, seriesKey: string) => {
        const row = rows.at(index);
        if (!row) {
            return;
        }

        const isComparisonSeries = seriesKey === CHART_SERIES_KEY.COMPARISON;
        const pressedWindow = isComparisonSeries ? comparison?.previous : comparison?.current;
        const pressedItem = (isComparisonSeries ? row.comparisonItem : row.item) ?? row.item;
        // A time bucket opens the dates it covers; a ranking group opens its own rows over the period its series plots.
        const dateRange = getBucketRange ? getBucketRange(pressedItem) : pressedWindow?.range;
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
export type {SearchChartComparison, SearchChartWindow};
