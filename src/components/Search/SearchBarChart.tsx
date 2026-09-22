import {BarChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts';

import React from 'react';

import type {SearchChartProps} from './types';

function SearchBarChart({data, series, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    const handleBarPress = (dataPoint: ChartDataPoint, index: number, seriesKey: string) => {
        onItemPress?.(index, seriesKey);
    };

    return (
        <BarChart
            data={data}
            series={series}
            isLoading={isLoading}
            onBarPress={handleBarPress}
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

export default SearchBarChart;
