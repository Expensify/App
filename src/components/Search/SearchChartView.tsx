import React from 'react';
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
import DateUtils from '@libs/DateUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {formatToParts} from '@libs/NumberFormatUtils';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SearchBarChart from './SearchBarChart';
import SearchLineChart from './SearchLineChart';
import SearchPieChart from './SearchPieChart';
import type {ChartView, GroupedItem, SearchChartProps, SearchGroupBy, SearchQueryJSON} from './types';

// --- DEBUG MOCK DATA (set MOCK_DATA_INDEX to -1 to disable) ---
const MOCK_DATA_INDEX = -1;

function mockMonthItems(entries: Array<[string, number]>): GroupedItem[] {
    return entries.map(([label, total]) => ({formattedMonth: label, total: total * 100, currency: 'USD', month: 1, year: 2025}) as unknown as GroupedItem);
}

const MOCK_DATASETS: Array<{label: string; groupBy: SearchGroupBy; data: GroupedItem[]}> = [
    {
        label: '0: 3 short labels',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['Jan', 1200],
            ['Feb', 3400],
            ['Mar', 2100],
        ]),
    },
    {
        label: '1: 12 short labels (full year)',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['Jan', 1200],
            ['Feb', 3400],
            ['Mar', 2100],
            ['Apr', 800],
            ['May', 4500],
            ['Jun', 3200],
            ['Jul', 2900],
            ['Aug', 1100],
            ['Sep', 5600],
            ['Oct', 4100],
            ['Nov', 2700],
            ['Dec', 3800],
        ]),
    },
    {
        label: '2: 6 long labels (full month names)',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['January', 1200],
            ['February', 3400],
            ['March', 2100],
            ['April', 800],
            ['May', 4500],
            ['June', 3200],
        ]),
    },
    {
        label: '3: 12 long labels (month + year)',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['January 2024', 1200],
            ['February 2024', 3400],
            ['March 2024', 2100],
            ['April 2024', 800],
            ['May 2024', 4500],
            ['June 2024', 3200],
            ['July 2024', 2900],
            ['August 2024', 1100],
            ['September 2024', 5600],
            ['October 2024', 4100],
            ['November 2024', 2700],
            ['December 2024', 3800],
        ]),
    },
    {
        label: '4: mixed lengths (long edges)',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['January 2024', 1200],
            ['Feb', 3400],
            ['Mar', 2100],
            ['Apr', 800],
            ['December 2024', 3800],
        ]),
    },
    {
        label: '5: very long labels (categories)',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['Office Supplies & Equipment', 4200],
            ['Travel & Transportation', 3100],
            ['Software Subscriptions', 2800],
            ['Professional Services', 1900],
        ]),
    },
    {
        label: '6: 2 data points',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['January 2024', 5000],
            ['February 2024', 3200],
        ]),
    },
    {
        label: '7: 24 data points (2 years monthly)',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([
            ['Jan 24', 12],
            ['Feb 24', 34],
            ['Mar 24', 21],
            ['Apr 24', 8],
            ['May 24', 45],
            ['Jun 24', 32],
            ['Jul 24', 29],
            ['Aug 24', 11],
            ['Sep 24', 56],
            ['Oct 24', 41],
            ['Nov 24', 27],
            ['Dec 24', 38],
            ['Jan 25', 15],
            ['Feb 25', 42],
            ['Mar 25', 19],
            ['Apr 25', 33],
            ['May 25', 51],
            ['Jun 25', 22],
            ['Jul 25', 37],
            ['Aug 25', 14],
            ['Sep 25', 48],
            ['Oct 25', 30],
            ['Nov 25', 25],
            ['Dec 25', 44],
        ]),
    },
    {
        label: '8: single data point',
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        data: mockMonthItems([['September 2024', 4200]]),
    },
];
// --- END DEBUG MOCK DATA ---

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

    /** The view type (bar, etc.) */
    view: ChartView;

    /** The groupBy parameter */
    groupBy: SearchGroupBy;

    /** Grouped transaction data from search results */
    data: GroupedItem[];

    /** Whether data is loading */
    isLoading?: boolean;

    /** Scroll handler for hiding the top bar on mobile */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Title to be displayed on the chart */
    title: string;
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
function SearchChartView({queryJSON, view, groupBy: groupByProp, data: dataProp, isLoading, onScroll, title}: SearchChartViewProps) {
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Users', 'CreditCard', 'Send', 'Folder', 'Basket', 'Tag', 'Calendar']);

    // --- DEBUG: override data with mock when MOCK_DATA_INDEX >= 0 ---
    const mockDataset = MOCK_DATA_INDEX >= 0 ? MOCK_DATASETS.at(MOCK_DATA_INDEX) : undefined;
    const data = mockDataset?.data ?? dataProp;
    const groupBy = mockDataset?.groupBy ?? groupByProp;
    // --- END DEBUG ---

    const {titleIconName, getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const titleIcon = icons[titleIconName];
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
                    unit={unit}
                    unitPosition={unitPosition}
                />
            </View>
        </Animated.ScrollView>
    );
}

SearchChartView.displayName = 'SearchChartView';

export default SearchChartView;
