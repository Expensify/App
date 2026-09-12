import {PieChart} from '@components/Charts';

import React from 'react';

import type {SearchChartProps} from './types';

function SearchPieChart({data, onItemPress, isLoading, unit, unitPosition, shouldShowLegend}: SearchChartProps) {
    return (
        <PieChart
            data={data}
            isLoading={isLoading}
            onSlicePress={(dataPoint, index) => onItemPress?.(index)}
            valueUnit={unit?.value}
            valueUnitPosition={unitPosition}
            shouldShowLegend={shouldShowLegend}
        />
    );
}

SearchPieChart.displayName = 'SearchPieChart';

export default SearchPieChart;
