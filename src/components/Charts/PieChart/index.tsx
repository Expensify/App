import React from 'react';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    return (
        <SkiaWebChart
            getComponent={getPieChartContent}
            componentProps={props}
            reasonContext="PieChart.SkiaWebLoading"
        />
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
