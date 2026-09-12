import {BarChart} from '@components/Charts';

import React from 'react';

import type {SearchChartProps} from './types';

function SearchBarChart({data, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    return (
        <BarChart
            data={data}
            isLoading={isLoading}
            onBarPress={(dataPoint, index) => onItemPress?.(index)}
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

SearchBarChart.displayName = 'SearchBarChart';

export default SearchBarChart;
