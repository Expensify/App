import ChartFrame from '@components/Charts/components/ChartFrame';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

import LineChartContent from './LineChartContent';

function LineChart(props: LineChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            loadingHeight={getCartesianChartHeight()}
        >
            {(chartWidth) => (
                <LineChartContent
                    {...props}
                    chartWidth={chartWidth}
                />
            )}
        </ChartFrame>
    );
}

LineChart.displayName = 'LineChart';

export default LineChart;
