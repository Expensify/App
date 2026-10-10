import ChartFrame from '@components/Charts/components/ChartFrame';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            loadingHeight={getPieChartLoadingHeight(props.shouldShowLegend)}
        >
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getPieChartContent}
                    componentProps={{...props, chartWidth}}
                    shouldShowLoadingSpinner={false}
                />
            )}
        </ChartFrame>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;
