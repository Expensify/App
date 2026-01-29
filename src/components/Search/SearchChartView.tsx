import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import ScrollView from '@components/ScrollView';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencyDisplayInfoForCharts} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SearchBarChart from './SearchBarChart';
import type {ChartView, SearchGroupBy, SearchQueryJSON} from './types';

type GroupedItem =
    | TransactionMemberGroupListItemType
    | TransactionCardGroupListItemType
    | TransactionWithdrawalIDGroupListItemType
    | TransactionCategoryGroupListItemType
    | TransactionMerchantGroupListItemType
    | TransactionTagGroupListItemType
    | TransactionMonthGroupListItemType
    | TransactionWeekGroupListItemType;

type ChartGroupByConfig = {
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Building' | 'Tag' | 'Calendar';
    getLabel: (item: GroupedItem) => string;
    getFilterQuery: (item: GroupedItem) => string;
};

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts.
 */
const CHART_GROUP_BY_CONFIG: Record<SearchGroupBy, ChartGroupByConfig> = {
    [CONST.SEARCH.GROUP_BY.FROM]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item as TransactionMemberGroupListItemType).formattedFrom ?? '',
        getFilterQuery: (item: GroupedItem) => `from:${(item as TransactionMemberGroupListItemType).accountID}`,
    },
    [CONST.SEARCH.GROUP_BY.CARD]: {
        titleIconName: 'CreditCard',
        getLabel: (item: GroupedItem) => (item as TransactionCardGroupListItemType).formattedCardName ?? '',
        getFilterQuery: (item: GroupedItem) => `cardID:${(item as TransactionCardGroupListItemType).cardID}`,
    },
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: {
        titleIconName: 'Send',
        // eslint-disable-next-line rulesdir/no-default-id-values -- formattedWithdrawalID is a display label, not an Onyx ID
        getLabel: (item: GroupedItem) => (item as TransactionWithdrawalIDGroupListItemType).formattedWithdrawalID ?? '',
        getFilterQuery: (item: GroupedItem) => `withdrawalID:${(item as TransactionWithdrawalIDGroupListItemType).entryID}`,
    },
    [CONST.SEARCH.GROUP_BY.CATEGORY]: {
        titleIconName: 'Folder',
        getLabel: (item: GroupedItem) => (item as TransactionCategoryGroupListItemType).formattedCategory ?? '',
        getFilterQuery: (item: GroupedItem) => `category:"${(item as TransactionCategoryGroupListItemType).category}"`,
    },
    [CONST.SEARCH.GROUP_BY.MERCHANT]: {
        titleIconName: 'Building',
        getLabel: (item: GroupedItem) => (item as TransactionMerchantGroupListItemType).formattedMerchant ?? '',
        getFilterQuery: (item: GroupedItem) => `merchant:"${(item as TransactionMerchantGroupListItemType).merchant}"`,
    },
    [CONST.SEARCH.GROUP_BY.TAG]: {
        titleIconName: 'Tag',
        getLabel: (item: GroupedItem) => (item as TransactionTagGroupListItemType).formattedTag ?? '',
        getFilterQuery: (item: GroupedItem) => `tag:"${(item as TransactionTagGroupListItemType).tag}"`,
    },
    [CONST.SEARCH.GROUP_BY.MONTH]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionMonthGroupListItemType).formattedMonth ?? '',
        getFilterQuery: (item: GroupedItem) => {
            const monthItem = item as TransactionMonthGroupListItemType;
            return `date>=${monthItem.year}-${String(monthItem.month).padStart(2, '0')}-01 date<${monthItem.month === 12 ? monthItem.year + 1 : monthItem.year}-${String(monthItem.month === 12 ? 1 : monthItem.month + 1).padStart(2, '0')}-01`;
        },
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionWeekGroupListItemType).formattedWeek ?? '',
        getFilterQuery: (item: GroupedItem) => {
            const weekItem = item as TransactionWeekGroupListItemType;
            // week is in YYYY-MM-DD format (start of week)
            const startDate = new Date(weekItem.week);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
            const endDateStr = endDate.toISOString().split('T').at(0);
            return `date>=${weekItem.week} date<${endDateStr}`;
        },
    },
};

type SearchChartViewProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON;

    /** The view type (bar, etc.) */
    view: Exclude<ChartView, 'line' | 'pie'>;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: TransactionGroupListItemType[];

    /** Whether data is loading */
    isLoading?: boolean;
};

/**
 * Map of chart view types to their corresponding chart components.
 */
const CHART_VIEW_TO_COMPONENT: Record<Exclude<ChartView, 'line' | 'pie'>, typeof SearchBarChart> = {
    [CONST.SEARCH.VIEW.BAR]: SearchBarChart,
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, isLoading}: SearchChartViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'CreditCard', 'Send', 'Folder', 'Building', 'Tag', 'Calendar'] as const);
    const {titleIconName, getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const titleIcon = icons[titleIconName];
    const title = translate(`search.chartTitles.${groupBy}`);
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view];

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

    return (
        <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
        >
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.mh4, styles.mb4, styles.flex1]}>
                <ChartComponent
                    data={data}
                    title={title}
                    titleIcon={titleIcon}
                    getLabel={getLabel}
                    getFilterQuery={getFilterQuery}
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
