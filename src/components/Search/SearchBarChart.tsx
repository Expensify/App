import React, {useCallback, useMemo} from 'react';
import {BarChart} from '@components/Charts';
import type {BarChartDataPoint} from '@components/Charts';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {SearchGroupBy} from './types';

type GroupedItem =
    | TransactionMemberGroupListItemType
    | TransactionCardGroupListItemType
    | TransactionWithdrawalIDGroupListItemType
    | TransactionCategoryGroupListItemType;

type SearchBarChartProps = {
    /** Grouped transaction data from search results */
    data: TransactionGroupListItemType[];

    /** The groupBy parameter from the search query */
    groupBy: SearchGroupBy;

    /** Callback when a bar is pressed - receives the filter query to apply */
    onBarPress?: (filterQuery: string) => void;

    /** Whether data is loading */
    isLoading?: boolean;
};

/**
 * Configuration for each groupBy type - defines how to extract label and build filter query
 */
const GROUP_BY_CONFIG = {
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

function SearchBarChart({data, groupBy, onBarPress, isLoading}: SearchBarChartProps) {
    const config = GROUP_BY_CONFIG[groupBy];

    // Transform grouped transaction data to BarChart format
    const chartData: BarChartDataPoint[] = useMemo(() => {
        if (!config) {
            return [];
        }

        return data.map((item) => {
            const groupedItem = item as GroupedItem;
            const total = item.transactions.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);
            // Convert from cents to dollars
            const totalInDollars = total / 100;
            const currency = item.transactions.at(0)?.currency ?? 'USD';

            return {
                label: config.getLabel(groupedItem),
                total: totalInDollars,
                currency,
            };
        });
    }, [data, config]);

    const handleBarPress = useCallback(
        (dataPoint: BarChartDataPoint, index: number) => {
            if (!onBarPress || !config) {
                return;
            }

            const item = data.at(index);
            if (!item) {
                return;
            }

            const filterQuery = config.getFilterQuery(item as GroupedItem);
            onBarPress(filterQuery);
        },
        [data, config, onBarPress],
    );

    // Get currency symbol for Y-axis
    const yAxisUnit = useMemo(() => {
        const firstCurrency = chartData.at(0)?.currency ?? 'USD';
        // Simple currency symbol mapping
        if (firstCurrency === 'USD') {
            return '$';
        }
        if (firstCurrency === 'EUR') {
            return '€';
        }
        if (firstCurrency === 'GBP') {
            return '£';
        }
        return '';
    }, [chartData]);

    if (!config) {
        return null;
    }

    return (
        <BarChart
            data={chartData}
            title={config.title}
            titleIcon={config.titleIcon}
            isLoading={isLoading}
            onBarPress={handleBarPress}
            yAxisUnit={yAxisUnit}
        />
    );
}

SearchBarChart.displayName = 'SearchBarChart';

export default SearchBarChart;
