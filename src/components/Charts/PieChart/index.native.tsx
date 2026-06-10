import React from 'react';
import type {PieChartProps} from './PieChartContent';
import PieChartContent from './PieChartContent';

function PieChart(props: PieChartProps) {
    return <PieChartContent {...props} />;
}

PieChart.displayName = 'PieChart';

export default PieChart;
