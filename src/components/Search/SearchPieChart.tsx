import {PieChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts/types';

import React from 'react';

import type {SearchChartProps} from './types';

function SearchPieChart({data, series, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    const handleSlicePress = (dataPoint: ChartDataPoint, index: number) => {
        const primarySeriesKey = series.at(0)?.key;
        if (!primarySeriesKey) {
            return;
        }
        onItemPress?.(index, primarySeriesKey);
    };

    return (
        <PieChart
            data={data}
            series={series}
            isLoading={isLoading}
            onSlicePress={handleSlicePress}
            valueUnit={unit?.value}
            valueUnitPosition={unitPosition}
        />
    );
}

export default SearchPieChart;
