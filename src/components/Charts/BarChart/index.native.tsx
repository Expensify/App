import ChartFrame from '@components/Charts/components/ChartFrame';
import {getBarChartHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type BarChartProps from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            loadingHeight={getBarChartHeight(props.shouldShowLabels)}
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
