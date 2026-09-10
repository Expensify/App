import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import type {ChartView, GroupedItem, SearchChartDataRow, SearchChartProps, SearchGroupBy, SearchQueryJSON} from './types';

import {buildChartSeries} from './buildChartSeries';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import SearchBarChart from './SearchBarChart';
import SearchLineChart from './SearchLineChart';
import SearchPieChart from './SearchPieChart';

type SearchChartViewProps = {
    queryJSON: Readonly<SearchQueryJSON>;

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    isLoading?: boolean;

    /**
     * Renders the details of the plotted groups below the chart, from the same prepared rows the
     * chart itself plots. Left out, the chart renders on its own as it always has.
     */
    renderDetails?: (rows: SearchChartDataRow[]) => React.ReactNode;
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
function SearchChartView({queryJSON, view, groupBy, data, isLoading, renderDetails}: SearchChartViewProps) {
    const {preferredLocale} = useLocalize();
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();

    const {getLabel, getShortLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view];

    // Prepared once here so the chart and the details below it plot and list the very same rows.
    const rows = buildChartSeries({data, view, getLabel, getShortLabel, getCurrencyDecimals});

    const handleItemPress = (index: number) => {
        const item = rows.at(index)?.item;
        if (!item) {
            return;
        }

        const currentQueryString = buildSearchQueryString(queryJSON);
        const parsedQueryJSON = buildSearchQueryJSON(`${currentQueryString} ${getFilterQuery(item)}`);

        if (!parsedQueryJSON) {
            Log.alert('[SearchChartView] Failed to build search query JSON from filter query');
            return;
        }
        const newQueryJSON: SearchQueryJSON = {
            ...parsedQueryJSON,
            groupBy: undefined,
            view: CONST.SEARCH.VIEW.TABLE,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        };

        const newQueryString = buildSearchQueryString(newQueryJSON);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: newQueryString}));
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
        <>
            <ChartComponent
                data={rows.map((row) => row.point)}
                onItemPress={handleItemPress}
                isLoading={isLoading}
                unit={unit}
                unitPosition={unitPosition}
                shouldShowLegend={!renderDetails}
            />
            {renderDetails?.(rows)}
        </>
    );
}

export default SearchChartView;
