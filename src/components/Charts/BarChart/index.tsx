import SkiaWebChart from '@components/Charts/SkiaWebChart';

import React from 'react';

import type {BarChartProps} from './BarChartContent';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    return (
        <SkiaWebChart
            getComponent={getBarChartContent}
            componentProps={props}
            reasonContext="BarChart.SkiaWebLoading"
        />
    );
}

export default BarChart;
