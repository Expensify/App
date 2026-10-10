import ChartFrame from '@components/Charts/components/ChartFrame';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getBarChartHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type BarChartProps from './types';

const getBarChartContent = () => import('./BarChartContent');

function BarChart(props: BarChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            loadingHeight={getBarChartHeight(props.shouldShowLabels)}
        >
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getBarChartContent}
                    componentProps={{...props, chartWidth}}
                />
            )}
        </ChartFrame>
    );
}

export default BarChart;
