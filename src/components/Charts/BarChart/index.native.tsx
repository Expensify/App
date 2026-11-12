import ChartFrame from '@components/Charts/components/ChartFrame';
import {getBarChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type BarChartProps from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            getLoadingHeight={() => getBarChartLoadingHeight(props.shouldShowLabels, props.shouldWrapLabels)}
        >
            {(chartWidth) => (
                <BarChartContent
                    {...props}
                    chartWidth={chartWidth}
                />
            )}
        </ChartFrame>
    );
}

export default BarChart;
