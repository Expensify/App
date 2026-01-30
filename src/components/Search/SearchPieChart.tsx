import React, { useCallback, useMemo } from 'react';
import { PieChart } from '@components/Charts';
import type { PieChartDataPoint } from '@components/Charts/types';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
} from '@components/SelectionListWithSections/types';
import { convertToFrontendAmountAsInteger } from '@libs/CurrencyUtils';
import type IconAsset from '@src/types/utils/IconAsset';

type GroupedItem = TransactionMemberGroupListItemType | TransactionCardGroupListItemType | TransactionWithdrawalIDGroupListItemType | TransactionCategoryGroupListItemType;

type SearchPieChartProps = {
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

    /** Callback when a slice is pressed - receives the filter query to apply */
    onBarPress?: (filterQuery: string) => void;

    /** Whether data is loading */
    isLoading?: boolean;

    /** Currency symbol for value labels in tooltip */
    yAxisUnit?: string;

    /** Position of currency symbol relative to value (unused for pie chart, for API compatibility with SearchBarChart) */
    yAxisUnitPosition?: 'left' | 'right';
};

function SearchPieChart({
    data,
    title,
    titleIcon,
    getLabel,
    getFilterQuery,
    onBarPress,
    isLoading,
    yAxisUnit,
    // Accepted for API compatibility with SearchChartView; pie chart does not use axis position
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    yAxisUnitPosition,
}: SearchPieChartProps) {
    // Transform grouped transaction data to PieChart format
    const chartData: PieChartDataPoint[] = useMemo(() => {
        return data.map((item) => {
            const groupedItem = item as GroupedItem;
            const currency = groupedItem.currency ?? 'USD';
            const valueInDisplayUnits = convertToFrontendAmountAsInteger(groupedItem.total ?? 0, currency);

            return {
                label: getLabel(groupedItem),
                value: valueInDisplayUnits,
                currency,
            };
        });
    }, [data, getLabel]);

    const handleSlicePress = useCallback(
        (dataPoint: PieChartDataPoint, index: number) => {
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
        <PieChart
            data={chartData}
            title={title}
            titleIcon={titleIcon}
            isLoading={isLoading}
            onSlicePress={handleSlicePress}
            valueUnit={yAxisUnit}
        />
    );
}

SearchPieChart.displayName = 'SearchPieChart';

export default SearchPieChart;
