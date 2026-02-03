import React from 'react';
import type {PieChartProps} from '@components/Charts/types';
import PieChartContent from './PieChartContent';

function PieChart(props: PieChartProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <PieChartContent {...props} />;
}

PieChart.displayName = 'PieChart';

export default PieChart;
