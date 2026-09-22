import {LineChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts';

import React from 'react';

import type {SearchChartProps} from './types';

function SearchLineChart({data, series, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    const handlePointPress = (dataPoint: ChartDataPoint, index: number, seriesKey: string) => {
        onItemPress?.(index, seriesKey);
    };

    return (
        <LineChart
            data={data}
            series={series}
            isLoading={isLoading}
            onPointPress={handlePointPress}
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

export default SearchLineChart;
