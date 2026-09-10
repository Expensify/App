import ChartWidthBox from '@components/Charts/ChartWidthBox';

import React from 'react';

import type {BarChartProps} from './BarChartContent';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <BarChartContent
                    {...props}
                    chartWidth={chartWidth}
                />
            )}
        </ChartWidthBox>
    );
}

BarChart.displayName = 'BarChart';

export default BarChart;
