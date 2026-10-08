import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');
function LineChart(props: LineChartProps) {
    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getCartesianChartHeight()}>
                    <SkiaWebChart
                        getComponent={getLineChartContent}
                        componentProps={{...props, chartWidth}}
                        shouldShowLoadingSpinner={false}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

export default LineChart;
