import ChartSkeleton from '@components/Charts/ChartSkeleton';
import ChartWidthBox from '@components/Charts/ChartWidthBox';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import CONST from '@src/CONST';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getPieChartContent}
                    componentProps={{...props, chartWidth}}
                    loadingFallback={<ChartSkeleton view={CONST.SEARCH.VIEW.PIE} />}
                />
            )}
        </ChartWidthBox>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
