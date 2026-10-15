import React from 'react';

import type BarChartProps from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    return <BarChartContent {...props} />;
}

export default BarChart;
