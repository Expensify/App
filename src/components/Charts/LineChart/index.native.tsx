import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

import LineChartContent from './LineChartContent';

function LineChart(props: LineChartProps) {
    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getCartesianChartHeight()}>
                    <LineChartContent
                        {...props}
                        chartWidth={chartWidth}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

LineChart.displayName = 'LineChart';

export default LineChart;
