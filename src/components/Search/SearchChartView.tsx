import {BarChart, LineChart, PieChart} from '@components/Charts';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

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
import type {ChartView, GroupedItem, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries} from './buildChartSeries';
import {buildChartDrillDownQuery, getBucketDrillDownRange} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import getInProgressBucketLabel from './getInProgressBucketLabel';
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

    /** Whether a bar chart labels its bars and a donut chart shows its legend. Line chart labels always show. */
    shouldShowGroupLabels?: boolean;

    /** Second series, when comparing */
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
function SearchChartView({queryJSON, view, groupBy, data, isLoading, shouldShowGroupLabels = true, comparison, renderDetails, chartContainerStyle}: SearchChartViewProps) {
    const {preferredLocale, translate, dateFnsLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getFilterQuery, getBucketRange} = CHART_GROUP_BY_CONFIG[groupBy];

    const today = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const dateFilterRange = queryJSON ? getDateFilterRange(queryJSON) : {};
    const model = buildChartSeries({
        rows: data,
        comparison,
        view,
        groupBy,
        getLabel,
        getShortLabel,
        getCurrencyDecimals,
        translate,
        dateFnsLocale,
        getInProgressLabel: (item) => getInProgressBucketLabel({groupBy, item, today, dateFnsLocale, dateFilterRange, translate}),
    });
    const {series, rows} = model;
    const points = rows.map((row) => row.point);

    const handleItemPress = (index: number) => {
        const row = rows.at(index);
        if (!row || !queryJSON) {
            return;
        }

        const primaryRange = comparison?.primaryPeriod.range;
        // Time buckets open their own dates; ranking groups open the current period.
        const dateRange = getBucketRange ? getBucketDrillDownRange(queryJSON, getBucketRange(row.item), primaryRange) : primaryRange;
        const query = buildChartDrillDownQuery(queryJSON, {groupFilter: getBucketRange ? undefined : getFilterQuery(row.item), dateRange});

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
                onBarPress={(dataPoint, index) => handleItemPress(index)}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
                shouldShowLabels={shouldShowGroupLabels}
            />
        ),
        [CONST.SEARCH.VIEW.LINE]: (
            <LineChart
                data={points}
                series={series}
                isLoading={isLoading}
                onPointPress={(dataPoint, index) => handleItemPress(index)}
                yAxisUnit={unit}
                yAxisUnitPosition={unitPosition}
            />
        ),
        [CONST.SEARCH.VIEW.PIE]: (
            <PieChart
                data={points}
                series={series}
                isLoading={isLoading}
                onSlicePress={(dataPoint, index) => handleItemPress(index)}
                valueUnit={unit.value}
                valueUnitPosition={unitPosition}
                shouldShowLegend={shouldShowGroupLabels}
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
