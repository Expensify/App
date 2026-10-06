import ChartWidthBox from '@components/Charts/ChartWidthBox';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import useBarChartOrientation from '@hooks/useBarChartOrientation';

import React from 'react';

import type {BarChartProps} from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    // With the Insights beta on: horizontal bars on wide layouts, vertical on narrow (mobile/RHP) unless labels don't fit. A single lazy module receives orientation as a prop.
    const {isHorizontal, canFallBackToHorizontalBars} = useBarChartOrientation();

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getBarChartContent}
                    componentProps={{...props, chartWidth, isHorizontal, canFallBackToHorizontalBars}}
                />
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
