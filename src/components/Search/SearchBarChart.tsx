import React from 'react';
import {BarChart} from '@components/Charts';
import type {ChartDataPoint, YAxisUnit, YAxisUnitPosition} from '@components/Charts';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type IconAsset from '@src/types/utils/IconAsset';
import type {GroupedItem} from './types';

type SearchBarChartProps = {
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

    /** Currency symbol for Y-axis labels with font fallback support. */
    yAxisUnit?: YAxisUnit;

    /** Position of currency symbol relative to value */
    yAxisUnitPosition?: YAxisUnitPosition;
};

function SearchBarChart({data, title, titleIcon, getLabel, getFilterQuery, onItemPress, isLoading, yAxisUnit, yAxisUnitPosition}: SearchBarChartProps) {
    // Transform grouped transaction data to BarChart format
    const chartData: ChartDataPoint[] = data.map((item) => {
        const currency = item.currency ?? 'USD';
        const totalInDisplayUnits = convertToFrontendAmountAsInteger(item.total ?? 0, currency);

        return {
            label: getLabel(item),
            total: totalInDisplayUnits,
        };
    });

    const handleBarPress = (dataPoint: ChartDataPoint, index: number) => {
        if (!onItemPress) {
            return;
        }

        const item = data.at(index);
        if (!item) {
            return;
        }

        const filterQuery = getFilterQuery(item);
        onItemPress(filterQuery);
    };

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
