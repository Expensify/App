import ChartWidthBox from '@components/Charts/components/ChartWidthBox';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

import PieChartContent from './PieChartContent';

function PieChart(props: PieChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <PieChartContent
                    {...props}
                    chartWidth={chartWidth}
                />
            )}
        </ChartWidthBox>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
