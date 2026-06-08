import React from 'react';
import type {BarChartProps} from './BarChartContent';
import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    return <BarChartContent {...props} />;
}

BarChart.displayName = 'BarChart';

export default BarChart;
