import React from 'react';
import type {BarChartProps} from '@components/Charts/types';
import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <BarChartContent {...props} />;
}

BarChart.displayName = 'BarChart';

export default BarChart;
