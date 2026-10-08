import {ChartFontsProvider} from '@components/Charts/hooks';

import React from 'react';

import type {BarChartBodyProps} from './types';

import VerticalBarChartContentBody from './VerticalBarChartContent';

function BarChartContent(props: BarChartBodyProps) {
    return (
        <ChartFontsProvider>
            <VerticalBarChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;
