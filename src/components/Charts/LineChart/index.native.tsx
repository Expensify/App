import ChartWidthBox from '@components/Charts/ChartWidthBox';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

import LineChartContent from './LineChartContent';

function LineChart(props: LineChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <LineChartContent
                    {...props}
                    chartWidth={chartWidth}
                />
            )}
        </ChartWidthBox>
    );
}

LineChart.displayName = 'LineChart';

export default LineChart;
