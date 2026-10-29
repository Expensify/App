import ChartFrame from '@components/Charts/components/ChartFrame';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            getLoadingHeight={(chartWidth) => getPieChartLoadingHeight(chartWidth, shouldUseNarrowLayout, props.shouldShowLegend, props.shouldUseResponsiveLegend)}
        >
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getPieChartContent}
                    componentProps={{...props, chartWidth}}
                />
            )}
        </ChartFrame>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
