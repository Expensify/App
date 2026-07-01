import React from 'react';
import type {LineChartProps} from './LineChartContent';
import LineChartContent from './LineChartContent';

function LineChart(props: LineChartProps) {
    return <LineChartContent {...props} />;
}

LineChart.displayName = 'LineChart';

export default LineChart;
