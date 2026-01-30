import React, {useCallback, useMemo} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencyDisplayInfoForCharts} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SearchBarChart from './SearchBarChart';
import SearchLineChart from './SearchLineChart';
import type {ChartView, GroupedItem, SearchGroupBy, SearchQueryJSON} from './types';

type ChartGroupByConfig = {
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Basket' | 'Tag' | 'Calendar';
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
        titleIconName: 'Basket',
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
            const {start, end} = DateUtils.getMonthDateRange(monthItem.year, monthItem.month);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionWeekGroupListItemType).formattedWeek ?? '',
        getFilterQuery: (item: GroupedItem) => {
            const weekItem = item as TransactionWeekGroupListItemType;
            const {start, end} = DateUtils.getWeekDateRange(weekItem.week);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionYearGroupListItemType).formattedYear ?? '',
        getFilterQuery: (item: GroupedItem) => {
            const yearItem = item as TransactionYearGroupListItemType;
            const {start, end} = DateUtils.getYearDateRange(yearItem.year);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionQuarterGroupListItemType).formattedQuarter ?? '',
        getFilterQuery: (item: GroupedItem) => {
            const quarterItem = item as TransactionQuarterGroupListItemType;
            const {start, end} = DateUtils.getQuarterDateRange(quarterItem.year, quarterItem.quarter);
            return `date>=${start} date<=${end}`;
        },
    },
};

type SearchChartViewProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON;

    /** The view type (bar, line, etc.) */
    view: Exclude<ChartView, 'pie'>;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    /** Whether data is loading */
    isLoading?: boolean;

    /** Scroll handler for hiding the top bar on mobile */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

/**
 * Map of chart view types to their corresponding chart components.
 */
const CHART_VIEW_TO_COMPONENT: Record<Exclude<ChartView, 'pie'>, typeof SearchBarChart | typeof SearchLineChart> = {
    [CONST.SEARCH.VIEW.BAR]: SearchBarChart,
    [CONST.SEARCH.VIEW.LINE]: SearchLineChart,
};

/**
 * Layer 3 component - dispatches to the appropriate chart type based on view parameter
 * and handles navigation/drill-down logic
 */
function SearchChartView({queryJSON, view, groupBy, data, isLoading, onScroll}: SearchChartViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'CreditCard', 'Send', 'Folder', 'Basket', 'Tag', 'Calendar'] as const);
    const {titleIconName, getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const titleIcon = icons[titleIconName];
    const title = translate(`search.chartTitles.${groupBy}`);
    const ChartComponent = CHART_VIEW_TO_COMPONENT[view];

    const handleItemPress = useCallback(
        (filterQuery: string) => {
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
        },
        [queryJSON],
    );

    const {yAxisUnit, yAxisUnitPosition} = useMemo((): {yAxisUnit: string; yAxisUnitPosition: 'left' | 'right'} => {
        const firstItem = data.at(0);
        const currency = firstItem?.currency ?? 'USD';
        const {symbol, position} = getCurrencyDisplayInfoForCharts(currency);

        return {
            yAxisUnit: symbol,
            yAxisUnitPosition: position,
        };
    }, [data]);

    return (
        <Animated.ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
            onScroll={onScroll}
            scrollEventThrottle={16}
        >
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.mh4, styles.mb4, styles.flex1]}>
                <ChartComponent
                    data={data}
                    title={title}
                    titleIcon={titleIcon}
                    getLabel={getLabel}
                    getFilterQuery={getFilterQuery}
                    onItemPress={handleItemPress}
                    isLoading={isLoading}
                    yAxisUnit={yAxisUnit}
                    yAxisUnitPosition={yAxisUnitPosition}
                />
            </View>
        </Animated.ScrollView>
    );
}

SearchChartView.displayName = 'SearchChartView';

export default SearchChartView;
