import ChartSkeleton from '@components/Charts/ChartSkeleton';
import ChartWidthBox from '@components/Charts/ChartWidthBox';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import useBarChartOrientation from '@hooks/useBarChartOrientation';

import CONST from '@src/CONST';

import React from 'react';

import type {BarChartProps} from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    // Horizontal bars on wide layouts, vertical on narrow (mobile/RHP). A single lazy module receives orientation as a prop.
    const {isHorizontal} = useBarChartOrientation();

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getBarChartContent}
                    componentProps={{...props, chartWidth, isHorizontal}}
                    loadingFallback={<ChartSkeleton view={CONST.SEARCH.VIEW.BAR} />}
                />
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
