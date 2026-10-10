import ChartFrame from '@components/Charts/components/ChartFrame';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getCartesianChartHeight} from '@components/Charts/utils/chartHeights';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');

function LineChart(props: LineChartProps) {
    return (
        <ChartFrame
            isLoading={props.isLoading}
            hasData={props.data.length > 0}
            loadingHeight={getCartesianChartHeight()}
        >
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getLineChartContent}
                    componentProps={{...props, chartWidth}}
                />
            )}
        </ChartFrame>
    );
}

export default LineChart;
