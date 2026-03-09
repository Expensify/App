import React from 'react';
import {LineChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type {SearchChartProps} from './types';

function SearchLineChart({data, title, titleIcon, getLabel, getFilterQuery, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    const chartData: ChartDataPoint[] = data.map((item) => {
        const currency = item.currency ?? 'USD';
        const totalInDisplayUnits = convertToFrontendAmountAsInteger(item.total ?? 0, currency);

        return {
            label: getLabel(item),
            total: totalInDisplayUnits,
        };
    });

    const handlePointPress = (dataPoint: ChartDataPoint, index: number) => {
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
        <LineChart
            data={chartData}
            title={title}
            titleIcon={titleIcon}
            isLoading={isLoading}
            onPointPress={handlePointPress}
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

SearchLineChart.displayName = 'SearchLineChart';

export default SearchLineChart;
