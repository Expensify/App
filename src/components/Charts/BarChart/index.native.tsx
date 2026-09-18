import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

import React from 'react';

import type {BarChartProps} from './BarChartContent';

import BarChartContent from './BarChartContent';

function BarChart(props: BarChartProps) {
    // Horizontal bars on wide layouts, vertical on narrow (mobile/RHP).
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isHorizontal = !shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);

    return (
        <BarChartContent
            {...props}
            isHorizontal={isHorizontal}
        />
    );
}

export default BarChart;
