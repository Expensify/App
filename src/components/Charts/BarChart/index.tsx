import ChartWidthBox from '@components/Charts/components/ChartWidthBox';
import SkiaWebChart from '@components/Charts/SkiaWebChart';

import React from 'react';

import type BarChartProps from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <SkiaWebChart
                    getComponent={getBarChartContent}
                    componentProps={{...props, chartWidth}}
                />
            )}
        </ChartWidthBox>
    );
}

export default BarChart;
