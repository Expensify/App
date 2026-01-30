import React, {useCallback, useMemo} from 'react';
import {LineChart} from '@components/Charts';
import type {ChartDataPoint, YAxisUnitPosition} from '@components/Charts';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type IconAsset from '@src/types/utils/IconAsset';
import type {GroupedItem} from './types';

type SearchLineChartProps = {
    /** Grouped transaction data from search results */
    data: GroupedItem[];

    /** Chart title */
    title: string;

    /** Chart title icon */
    titleIcon: IconAsset;

    /** Function to extract label from grouped item */
    getLabel: (item: GroupedItem) => string;

    /** Function to build filter query from grouped item */
    getFilterQuery: (item: GroupedItem) => string;

    /** Callback when a chart item is pressed - receives the filter query to apply */
    onItemPress?: (filterQuery: string) => void;

    /** Whether data is loading */
    isLoading?: boolean;

    /** Currency symbol for Y-axis labels */
    yAxisUnit?: string;

    /** Position of currency symbol relative to value */
    yAxisUnitPosition?: YAxisUnitPosition;
};

function SearchLineChart({data, title, titleIcon, getLabel, getFilterQuery, onItemPress, isLoading, yAxisUnit, yAxisUnitPosition}: SearchLineChartProps) {
    const chartData: ChartDataPoint[] = useMemo(() => {
        return data.map((item) => {
            const currency = item.currency ?? 'USD';
            const totalInDisplayUnits = convertToFrontendAmountAsInteger(item.total ?? 0, currency);

            return {
                label: getLabel(item),
                total: totalInDisplayUnits,
            };
        });
    }, [data, getLabel]);

    const handlePointPress = useCallback(
        (dataPoint: ChartDataPoint, index: number) => {
            if (!onItemPress) {
                return;
            }

            const item = data.at(index);
            if (!item) {
                return;
            }

            const filterQuery = getFilterQuery(item);
            onItemPress(filterQuery);
        },
        [data, getFilterQuery, onItemPress],
    );

    return (
        <LineChart
            data={chartData}
            title={title}
            titleIcon={titleIcon}
            isLoading={isLoading}
            onPointPress={handlePointPress}
            yAxisUnit={yAxisUnit}
            yAxisUnitPosition={yAxisUnitPosition}
        />
    );
}

SearchLineChart.displayName = 'SearchLineChart';

export default SearchLineChart;
