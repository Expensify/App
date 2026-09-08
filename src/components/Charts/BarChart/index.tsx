import ChartSkeleton from '@components/Charts/ChartSkeleton';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import CONST from '@src/CONST';

import React from 'react';

import type {BarChartProps} from './BarChartContent';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    return (
        <SkiaWebChart
            getComponent={getBarChartContent}
            componentProps={props}
            loadingFallback={<ChartSkeleton view={CONST.SEARCH.VIEW.BAR} />}
        />
    );
}

export default BarChart;
