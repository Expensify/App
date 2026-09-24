import SkiaWebChart from '@components/Charts/SkiaWebChart';

import useBarChartOrientation from '@hooks/useBarChartOrientation';

import React from 'react';

import type {BarChartProps} from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    // Horizontal bars on wide layouts, vertical on narrow (mobile/RHP). A single lazy module receives orientation as a prop.
    const {isHorizontal} = useBarChartOrientation();

    return (
        <SkiaWebChart
            getComponent={getBarChartContent}
            componentProps={{...props, isHorizontal}}
        />
    );
}

export default BarChart;
