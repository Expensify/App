import React, {useCallback, useMemo} from 'react';
import {BarChart} from '@components/Charts';
import type {BarChartDataPoint} from '@components/Charts';
import type IconAsset from '@src/types/utils/IconAsset';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';

type GroupedItem =
    | TransactionMemberGroupListItemType
    | TransactionCardGroupListItemType
    | TransactionWithdrawalIDGroupListItemType
    | TransactionCategoryGroupListItemType;

type SearchBarChartProps = {
    /** Grouped transaction data from search results */
    data: TransactionGroupListItemType[];

    /** Chart title */
    title: string;

    /** Chart title icon */
    titleIcon: IconAsset;

    /** Function to extract label from grouped item */
    getLabel: (item: GroupedItem) => string;

    /** Function to build filter query from grouped item */
    getFilterQuery: (item: GroupedItem) => string;

    /** Callback when a bar is pressed - receives the filter query to apply */
    onBarPress?: (filterQuery: string) => void;

    /** Whether data is loading */
    isLoading?: boolean;
};

function SearchBarChart({data, title, titleIcon, getLabel, getFilterQuery, onBarPress, isLoading}: SearchBarChartProps) {
    // Transform grouped transaction data to BarChart format
    const chartData: BarChartDataPoint[] = useMemo(() => {
        return data.map((item) => {
            const groupedItem = item as GroupedItem;
            // Use the pre-calculated total from the API (already in cents, convert to dollars)
            const totalInDollars = (groupedItem.total ?? 0) / 100;
            const currency = groupedItem.currency ?? 'USD';

            return {
                label: getLabel(groupedItem),
                total: totalInDollars,
                currency,
            };
        });
    }, [data, getLabel]);

    const handleBarPress = useCallback(
        (dataPoint: BarChartDataPoint, index: number) => {
            if (!onBarPress) {
                return;
            }

            const item = data.at(index);
            if (!item) {
                return;
            }

            const filterQuery = getFilterQuery(item as GroupedItem);
            onBarPress(filterQuery);
        },
        [data, getFilterQuery, onBarPress],
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

    return (
        <BarChart
            data={chartData}
            title={title}
            titleIcon={titleIcon}
            isLoading={isLoading}
            onBarPress={handleBarPress}
            yAxisUnit={yAxisUnit}
        />
    );
}

SearchBarChart.displayName = 'SearchBarChart';

export default SearchBarChart;
