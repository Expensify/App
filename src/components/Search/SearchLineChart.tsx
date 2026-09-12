import {LineChart} from '@components/Charts';

import React from 'react';

import type {SearchChartProps} from './types';

function SearchLineChart({data, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    return (
        <LineChart
            data={data}
            isLoading={isLoading}
            onPointPress={(dataPoint, index) => onItemPress?.(index)}
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

SearchLineChart.displayName = 'SearchLineChart';

export default SearchLineChart;
