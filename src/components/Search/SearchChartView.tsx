import React, {useCallback} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import SearchBarChart from './SearchBarChart';
import type {SearchGroupBy, SearchParams, SearchQueryJSON, SearchView} from './types';

type GroupedItem =
    | TransactionMemberGroupListItemType
    | TransactionCardGroupListItemType
    | TransactionWithdrawalIDGroupListItemType
    | TransactionCategoryGroupListItemType;

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts
 */
const CHART_GROUP_BY_CONFIG = {
    [CONST.SEARCH.GROUP_BY.FROM]: {
        title: 'Submitters',
        titleIcon: Expensicons.Users,
        getLabel: (item: GroupedItem) => (item as TransactionMemberGroupListItemType).formattedFrom ?? '',
        getFilterQuery: (item: GroupedItem) => `from:${(item as TransactionMemberGroupListItemType).accountID}`,
    },
    [CONST.SEARCH.GROUP_BY.CARD]: {
        title: 'Cards',
        titleIcon: Expensicons.CreditCard,
        getLabel: (item: GroupedItem) => (item as TransactionCardGroupListItemType).formattedCardName ?? '',
        getFilterQuery: (item: GroupedItem) => `cardID:${(item as TransactionCardGroupListItemType).cardID}`,
    },
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: {
        title: 'Exports',
        titleIcon: Expensicons.Send,
        getLabel: (item: GroupedItem) => (item as TransactionWithdrawalIDGroupListItemType).formattedWithdrawalID ?? '',
        getFilterQuery: (item: GroupedItem) => `withdrawalID:${(item as TransactionWithdrawalIDGroupListItemType).entryID}`,
    },
    [CONST.SEARCH.GROUP_BY.CATEGORY]: {
        title: 'Categories',
        titleIcon: Expensicons.Folder,
        getLabel: (item: GroupedItem) => (item as TransactionCategoryGroupListItemType).formattedCategory ?? '',
        getFilterQuery: (item: GroupedItem) => `category:"${(item as TransactionCategoryGroupListItemType).category}"`,
    },
} as const;

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
    searchKey: SearchKey | undefined;

    /** Whether data is loading */
    isLoading?: boolean;
};

/**
 * Map of chart view types to their corresponding chart components
 */
const CHART_VIEW_TO_COMPONENT = {
    [CONST.SEARCH.VIEW.BAR]: SearchBarChart,
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

    const config = CHART_GROUP_BY_CONFIG[groupBy];
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view as keyof typeof CHART_VIEW_TO_COMPONENT];

    if (!config || !ChartComponent) {
        return null;
    }

    return (
        <ChartComponent
            data={data}
            title={config.title}
            titleIcon={config.titleIcon}
            getLabel={config.getLabel}
            getFilterQuery={config.getFilterQuery}
            onBarPress={handleBarPress}
            isLoading={isLoading}
        />
    );
}

SearchChartView.displayName = 'SearchChartView';

export default SearchChartView;
