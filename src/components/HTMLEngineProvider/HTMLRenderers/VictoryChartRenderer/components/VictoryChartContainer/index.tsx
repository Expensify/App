import React from 'react';
import VictoryChartContainerFixed from './VictoryChartContainerFixed';
import VictoryChartContainerResponsive from './VictoryChartContainerResponsive';

type ExplicitSize = {width: number; height: number};

type VictoryChartContainerProps = {
    children: React.ReactNode;
    explicitSize?: ExplicitSize;
};

function VictoryChartContainer({children, explicitSize}: VictoryChartContainerProps) {
    if (explicitSize) {
        return <VictoryChartContainerFixed layout={{kind: 'fixed', width: explicitSize.width, height: explicitSize.height}}>{children}</VictoryChartContainerFixed>;
    }

    return <VictoryChartContainerResponsive>{children}</VictoryChartContainerResponsive>;
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
