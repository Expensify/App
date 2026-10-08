import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import {getBarChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type BarChartProps from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getBarChartLoadingHeight(props.shouldShowLabels)}>
                    <BarChartContent
                        {...props}
                        chartWidth={chartWidth}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
