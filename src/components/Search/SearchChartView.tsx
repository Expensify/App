import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencyDisplayInfoForCharts} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchBarChart from './SearchBarChart';
import type {SearchGroupBy, SearchQueryJSON, SearchView} from './types';

type GroupedItem = TransactionMemberGroupListItemType | TransactionCardGroupListItemType | TransactionWithdrawalIDGroupListItemType | TransactionCategoryGroupListItemType;

type ChartGroupByConfig = {
    title: string;
    titleIcon: IconAsset;
    getLabel: (item: GroupedItem) => string;
    getFilterQuery: (item: GroupedItem) => string;
};

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts
 */
const CHART_GROUP_BY_CONFIG: Record<SearchGroupBy, ChartGroupByConfig> = {
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
};

type SearchChartViewProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON;

    /** The view type (bar, etc.) */
    view: SearchView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: TransactionGroupListItemType[];

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
function SearchChartView({queryJSON, view, groupBy, data, isLoading}: SearchChartViewProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const handleBarPress = useCallback(
        (filterQuery: string) => {
            // Build new query string from current query + filter, then parse it
            const currentQueryString = buildSearchQueryString(queryJSON);
            const newQueryJSON = buildSearchQueryJSON(`${currentQueryString} ${filterQuery}`);

            if (!newQueryJSON) {
                return;
            }

            // Modify the query object directly: remove groupBy and view to show table
            newQueryJSON.groupBy = undefined;
            newQueryJSON.view = CONST.SEARCH.VIEW.TABLE;

            // Build the final query string and navigate
            const newQueryString = buildSearchQueryString(newQueryJSON);
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: newQueryString}));
        },
        [queryJSON],
    );

    const config = CHART_GROUP_BY_CONFIG[groupBy];
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view as keyof typeof CHART_VIEW_TO_COMPONENT];

    // Get currency symbol and position from first data item
    const {yAxisUnit, yAxisUnitPosition} = useMemo((): {yAxisUnit: string; yAxisUnitPosition: 'left' | 'right'} => {
        const firstItem = data.at(0) as GroupedItem | undefined;
        const currency = firstItem?.currency ?? 'USD';
        const {symbol, position} = getCurrencyDisplayInfoForCharts(currency);

        return {
            yAxisUnit: symbol,
            yAxisUnitPosition: position,
        };
    }, [data]);

    if (!config || !ChartComponent) {
        return null;
    }

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
        >
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.mh4, styles.mb4, styles.flex1]}>
                <ChartComponent
                    data={data}
                    title={config.title}
                    titleIcon={config.titleIcon}
                    getLabel={config.getLabel}
                    getFilterQuery={config.getFilterQuery}
                    onBarPress={handleBarPress}
                    isLoading={isLoading}
                    yAxisUnit={yAxisUnit}
                    yAxisUnitPosition={yAxisUnitPosition}
                />
            </View>
        </ScrollView>
    );
}

SearchChartView.displayName = 'SearchChartView';

export default SearchChartView;
