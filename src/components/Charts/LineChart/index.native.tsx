import React from 'react';
import type {LineChartProps} from './LineChartContent';
import LineChartContent from './LineChartContent';

function LineChart(props: LineChartProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <LineChartContent {...props} />;
}

LineChart.displayName = 'LineChart';

export default LineChart;
