import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import {getBarChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import useBarChartOrientation from '@hooks/useBarChartOrientation';

import React from 'react';

import type {BarChartProps} from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    // With the Insights beta on: horizontal bars on wide layouts, vertical on narrow (mobile/RHP) unless labels don't fit.
    const {isHorizontal, canFallBackToHorizontalBars} = useBarChartOrientation();

    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getBarChartLoadingHeight(isHorizontal)}>
                    <BarChartContent
                        {...props}
                        chartWidth={chartWidth}
                        isHorizontal={isHorizontal}
                        canFallBackToHorizontalBars={canFallBackToHorizontalBars}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
