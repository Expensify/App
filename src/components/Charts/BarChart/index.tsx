import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getBarChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type BarChartProps from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getBarChartLoadingHeight(props.shouldShowLabels)}>
                    <SkiaWebChart
                        getComponent={getBarChartContent}
                        componentProps={{...props, chartWidth}}
                        shouldShowLoadingSpinner={false}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
