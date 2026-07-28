import SkiaWebChart from '@components/Charts/SkiaWebChart';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');
function LineChart(props: LineChartProps) {
    return (
        <SkiaWebChart
            getComponent={getLineChartContent}
            componentProps={props}
            reasonContext="LineChart.SkiaWebLoading"
        />
    );
}

export default LineChart;
