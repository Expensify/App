import useBarChartOrientation from '@hooks/useBarChartOrientation';

import React from 'react';

import type {BarChartProps} from './types';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    // Horizontal bars on wide layouts, vertical on narrow (mobile/RHP) unless labels don't fit.
    const {isHorizontal, canFallBackToHorizontalBars} = useBarChartOrientation();

    return (
        <BarChartContent
            {...props}
            isHorizontal={isHorizontal}
            canFallBackToHorizontalBars={canFallBackToHorizontalBars}
        />
    );
}

export default BarChart;
