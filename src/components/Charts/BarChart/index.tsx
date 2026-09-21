import SkiaWebChart from '@components/Charts/SkiaWebChart';

import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

import React from 'react';

import type {BarChartProps} from './types';

const getBarChartContent = () => import('./BarChartContent');
function BarChart(props: BarChartProps) {
    // Horizontal bars on wide layouts, vertical on narrow (mobile/RHP). A single lazy module receives orientation as a prop.
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isHorizontal = !shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);

    return (
        <SkiaWebChart
            getComponent={getBarChartContent}
            componentProps={{...props, isHorizontal}}
        />
    );
}

export default BarChart;
