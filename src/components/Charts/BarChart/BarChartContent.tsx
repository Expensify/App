import {ChartFontsProvider} from '@components/Charts/hooks';

import React from 'react';

import type {BarChartContentProps} from './types';

import VerticalBarChartContentBody from './VerticalBarChartContent';

function BarChartContent(props: BarChartContentProps) {
    return (
        <ChartFontsProvider>
            <VerticalBarChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;
