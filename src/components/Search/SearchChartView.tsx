import React from 'react';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import SearchBarChart from './SearchBarChart';
import SearchLineChart from './SearchLineChart';
import SearchPieChart from './SearchPieChart';
import type {ChartView, GroupedItem, SearchChartProps, SearchGroupBy, SearchQueryJSON} from './types';

type SearchChartViewProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON;

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    /** Whether data is loading */
    isLoading?: boolean;
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
function SearchChartView({queryJSON, view, groupBy, data, isLoading}: SearchChartViewProps) {
    const {preferredLocale} = useLocalize();

    const {getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view];

    const handleItemPress = (filterQuery: string) => {
        const currentQueryString = buildSearchQueryString(queryJSON);
        const newQueryJSON = buildSearchQueryJSON(`${currentQueryString} ${filterQuery}`);

        if (!newQueryJSON) {
            Log.alert('[SearchChartView] Failed to build search query JSON from filter query');
            return;
        }
        newQueryJSON.groupBy = undefined;
        newQueryJSON.view = CONST.SEARCH.VIEW.TABLE;

        const newQueryString = buildSearchQueryString(newQueryJSON);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: newQueryString}));
    };

    const firstItem = data.at(0);
    const currency = firstItem?.currency ?? 'USD';
    const parts = formatToParts(preferredLocale, 0, {style: 'currency', currency});
    const currencyPart = parts.find((p) => p.type === 'currency');
    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');
    const unit = {value: currencyPart?.value ?? currency, fallback: currency};
    const unitPosition = currencyIndex < integerIndex ? 'left' : 'right';

    return (
        <ChartComponent
            data={data}
            getLabel={getLabel}
            getFilterQuery={getFilterQuery}
            onItemPress={handleItemPress}
            isLoading={isLoading}
            unit={unit}
            unitPosition={unitPosition}
        />
    );
}

export default SearchChartView;
