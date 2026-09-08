import ChartSkeleton from '@components/Charts/ChartSkeleton';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import CONST from '@src/CONST';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    return (
        <SkiaWebChart
            getComponent={getPieChartContent}
            componentProps={props}
            loadingFallback={<ChartSkeleton view={CONST.SEARCH.VIEW.PIE} />}
        />
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
