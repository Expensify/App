import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {convertToFrontendAmountAsInteger, sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import type {ChartBucketRange} from './chartGroupByConfig';
import type {ChartView, GroupedItem, SearchChartProps, SearchGroupBy, SearchQueryJSON} from './types';

import buildChartSeries, {CHART_SERIES_KEY} from './buildChartSeries';
import {buildChartDrillDownQuery} from './chartDrillDown';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import SearchBarChart from './SearchBarChart';
import {useSearchQueryContext} from './SearchContext';
import SearchLineChart from './SearchLineChart';
import SearchPieChart from './SearchPieChart';

/** How one of the compared windows is named, colored and bounded */
type SearchChartWindow = {
    /** Name shown in the legend and the tooltip */
    label: string;

    color: string;

    /** The dates the window covers, which a drill-down into one of its ranking bars narrows to */
    range: ChartBucketRange;
};

type SearchChartComparison = {
    /** The counterpart window's grouped rows, paired to the plotted ones */
    data: GroupedItem[];

    /** The window `data` was plotted from */
    current: SearchChartWindow;

    /** The window drawn beside it */
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

    /** The window drawn beside `data` as a second series, left out when nothing is compared */
    comparison?: SearchChartComparison;
};

/**
 * Map of chart view types to their corresponding chart components.
 */
const CHART_VIEW_TO_COMPONENT: Record<ChartView, React.ComponentType<SearchChartProps>> = {
    [CONST.SEARCH.VIEW.BAR]: SearchBarChart,
    [CONST.SEARCH.VIEW.LINE]: SearchLineChart,
    [CONST.SEARCH.VIEW.PIE]: SearchPieChart,
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, isLoading, color, comparison}: SearchChartViewProps) {
    const {preferredLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();

    const {getLabel, getShortLabel, getFilterQuery, getBucketRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view];

    const getAmount = (item: GroupedItem) => convertToFrontendAmountAsInteger(item.total ?? 0, getCurrencyDecimals(item.currency ?? CONST.CURRENCY.USD));

    const {series, rows} = buildChartSeries({
        primary: {
            rows: data,
            label: comparison?.current.label,
            color: comparison?.current.color ?? color,
            start: comparison?.current.range.start,
        },
        comparison: comparison
            ? {
                  rows: comparison.data,
                  label: comparison.previous.label,
                  color: comparison.previous.color,
                  start: comparison.previous.range.start,
              }
            : undefined,
        groupBy,
        getLabel: (item) => StringUtils.normalize(getLabel(item)),
        getShortLabel,
        getAmount,
    });

    const handleItemPress = (index: number, seriesKey: string) => {
        const row = rows.at(index);
        if (!row) {
            return;
        }

        const isComparisonSeries = seriesKey === CHART_SERIES_KEY.COMPARISON;
        const pressedWindow = isComparisonSeries ? comparison?.previous : comparison?.current;
        const pressedItem = (isComparisonSeries ? row.comparisonItem : row.item) ?? row.item;
        const dateRange = getBucketRange ? getBucketRange(pressedItem) : pressedWindow?.range;
        const query = buildChartDrillDownQuery(queryJSON, {
            groupFilter: getBucketRange ? undefined : getFilterQuery(pressedItem),
            dateRange,
        });

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

    return (
        <ChartComponent
            data={rows.map((row) => row.point)}
            series={series}
            onItemPress={handleItemPress}
            isLoading={isLoading}
            unit={unit}
            unitPosition={unitPosition}
        />
    );
}

export default SearchChartView;
export type {SearchChartComparison, SearchChartWindow};
