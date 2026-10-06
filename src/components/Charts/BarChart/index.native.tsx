import ChartWidthBox from '@components/Charts/ChartWidthBox';

import useBarChartOrientation from '@hooks/useBarChartOrientation';

import React from 'react';

import type {BarChartProps} from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    // With the Insights beta on: horizontal bars on wide layouts, vertical on narrow (mobile/RHP) unless labels don't fit.
    const {isHorizontal, canFallBackToHorizontalBars} = useBarChartOrientation();

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <BarChartContent
                    {...props}
                    chartWidth={chartWidth}
                    isHorizontal={isHorizontal}
                    canFallBackToHorizontalBars={canFallBackToHorizontalBars}
                />
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
