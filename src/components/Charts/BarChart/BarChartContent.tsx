import {ChartFontsProvider} from '@components/Charts/hooks';

import type {BarChartContentProps} from './types';

import HorizontalBarChartContentBody from './HorizontalBarChartContent';
import VerticalBarChartContentBody from './VerticalBarChartContent';

function BarChartContent({isHorizontal = false, ...props}: BarChartContentProps) {
    return <ChartFontsProvider>{isHorizontal ? <HorizontalBarChartContentBody {...props} /> : <VerticalBarChartContentBody {...props} />}</ChartFontsProvider>;
}

export default BarChartContent;
