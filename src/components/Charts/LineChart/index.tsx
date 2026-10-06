import ChartWidthBox from '@components/Charts/ChartWidthBox';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import React from 'react';

import type {LineChartProps} from './LineChartContent';

const getLineChartContent = () => import('./LineChartContent');
function LineChart(props: LineChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getLineChartContent}
                    componentProps={{...props, chartWidth}}
                />
            )}
        </ChartWidthBox>
    );
}

export default LineChart;
