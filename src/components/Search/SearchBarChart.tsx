import React from 'react';
import {BarChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type {SearchChartProps} from './types';

function SearchBarChart({data, title, titleIcon, getLabel, getFilterQuery, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
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
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

SearchBarChart.displayName = 'SearchBarChart';

export default SearchBarChart;
