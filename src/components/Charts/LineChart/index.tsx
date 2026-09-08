import ChartSkeleton from '@components/Charts/ChartSkeleton';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import CONST from '@src/CONST';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');
function LineChart(props: LineChartProps) {
    return (
        <SkiaWebChart
            getComponent={getLineChartContent}
            componentProps={props}
            loadingFallback={<ChartSkeleton view={CONST.SEARCH.VIEW.LINE} />}
        />
    );
}

export default LineChart;
