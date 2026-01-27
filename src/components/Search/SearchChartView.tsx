import React, {useCallback} from 'react';
import type {TransactionGroupListItemType} from '@components/SelectionListWithSections/types';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import SearchBarChart from './SearchBarChart';
import type {SearchGroupBy, SearchParams, SearchQueryJSON, SearchView} from './types';

type SearchChartViewProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON;

    /** The view type (bar, etc.) */
    view: SearchView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: TransactionGroupListItemType[];

    /** Callback to execute a new search */
    handleSearch: (params: SearchParams) => void;

    /** Search key for the current search */
    searchKey: string | undefined;

    /** Whether data is loading */
    isLoading?: boolean;
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, handleSearch, searchKey, isLoading}: SearchChartViewProps) {
    const handleBarPress = useCallback(
        (filterQuery: string) => {
            // Build new query: keep current query but remove groupBy and add the filter
            const currentQuery = buildSearchQueryString(queryJSON);
            // Remove group-by from query and add filter
            const newQuery = currentQuery.replace(/\s*group-by:\S+/g, '') + ` ${filterQuery}`;
            const newQueryJSON = buildSearchQueryJSON(newQuery.trim());
            if (newQueryJSON) {
                handleSearch({queryJSON: newQueryJSON, searchKey, offset: 0, shouldCalculateTotals: false, isLoading: false});
            }
        },
        [queryJSON, handleSearch, searchKey],
    );

    // Dispatch to appropriate chart based on view type
    switch (view) {
        case CONST.SEARCH.VIEW.BAR:
            return (
                <SearchBarChart
                    data={data}
                    groupBy={groupBy}
                    onBarPress={handleBarPress}
                    isLoading={isLoading}
                />
            );
        default:
            return null;
    }
}

SearchChartView.displayName = 'SearchChartView';

export default SearchChartView;
