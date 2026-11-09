import ChartFrame from '@components/Charts/components/ChartFrame';
import {getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

import PieChartContent from './PieChartContent';

function PieChart(props: PieChartProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            getLoadingHeight={(chartWidth) => getPieChartLoadingHeight(chartWidth, shouldUseNarrowLayout, props.shouldShowLegend, props.shouldUseResponsiveLegend)}
        >
            {(chartWidth) => (
                <PieChartContent
                    {...props}
                    chartWidth={chartWidth}
                />
            )}
        </ChartFrame>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
