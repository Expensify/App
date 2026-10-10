import ChartFrame from '@components/Charts/components/ChartFrame';
import {getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

import PieChartContent from './PieChartContent';

function PieChart(props: PieChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            loadingHeight={getPieChartLoadingHeight(props.shouldShowLegend)}
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
