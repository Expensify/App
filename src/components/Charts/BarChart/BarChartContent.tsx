import {ChartFontsProvider} from '@components/Charts/hooks';

import React from 'react';

import type BarChartProps from './types';

import VerticalBarChartContentBody from './VerticalBarChartContent';

function BarChartContent(props: BarChartProps) {
    return (
        <ChartFontsProvider>
            <VerticalBarChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;
