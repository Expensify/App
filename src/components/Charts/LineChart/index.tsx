import ChartSkeleton from '@components/Charts/ChartSkeleton';
import ChartWidthBox from '@components/Charts/ChartWidthBox';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import CONST from '@src/CONST';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');
function LineChart(props: LineChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getLineChartContent}
                    componentProps={{...props, chartWidth}}
                    loadingFallback={<ChartSkeleton view={CONST.SEARCH.VIEW.LINE} />}
                />
            )}
        </ChartWidthBox>
    );
}

export default LineChart;
