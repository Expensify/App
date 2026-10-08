import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getBarChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import useBarChartOrientation from '@hooks/useBarChartOrientation';

import React from 'react';

import type {BarChartProps} from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    // With the Insights beta on: horizontal bars on wide layouts, vertical on narrow (mobile/RHP) unless labels don't fit. A single lazy module receives orientation as a prop.
    const {isHorizontal, canFallBackToHorizontalBars} = useBarChartOrientation();

    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getBarChartLoadingHeight(isHorizontal)}>
                    <SkiaWebChart
                        getComponent={getBarChartContent}
                        componentProps={{...props, chartWidth, isHorizontal, canFallBackToHorizontalBars}}
                        shouldShowLoadingSpinner={false}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
