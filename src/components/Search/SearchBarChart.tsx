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
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type IconAsset from '@src/types/utils/IconAsset';

type GroupedItem = TransactionMemberGroupListItemType | TransactionCardGroupListItemType | TransactionWithdrawalIDGroupListItemType | TransactionCategoryGroupListItemType;

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

    /** Currency symbol for Y-axis labels */
    yAxisUnit?: string;

    /** Position of currency symbol relative to value */
    yAxisUnitPosition?: 'left' | 'right';
};

function SearchBarChart({data, title, titleIcon, getLabel, getFilterQuery, onBarPress, isLoading, yAxisUnit, yAxisUnitPosition}: SearchBarChartProps) {
    // Transform grouped transaction data to BarChart format
    const chartData: BarChartDataPoint[] = useMemo(() => {
        return data.map((item) => {
            const groupedItem = item as GroupedItem;
            const currency = groupedItem.currency ?? 'USD';
            const totalInDisplayUnits = convertToFrontendAmountAsInteger(groupedItem.total ?? 0, currency);

            return {
                label: getLabel(groupedItem),
                total: totalInDisplayUnits,
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

    return (
        <BarChart
            data={chartData}
            title={title}
            titleIcon={titleIcon}
            isLoading={isLoading}
            onBarPress={handleBarPress}
            yAxisUnit={yAxisUnit}
            yAxisUnitPosition={yAxisUnitPosition}
        />
    );
}

SearchBarChart.displayName = 'SearchBarChart';

export default SearchBarChart;
