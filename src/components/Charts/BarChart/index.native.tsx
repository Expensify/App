import ChartWidthBox from '@components/Charts/components/ChartWidthBox';

import React from 'react';

import type BarChartProps from './types';

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

export default BarChart;
