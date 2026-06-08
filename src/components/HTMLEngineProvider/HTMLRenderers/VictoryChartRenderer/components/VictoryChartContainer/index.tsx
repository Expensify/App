import React from 'react';
import VictoryChartContainerFixed from './VictoryChartContainerFixed';
import VictoryChartContainerResponsive from './VictoryChartContainerResponsive';

type ExplicitSize = {width: number; height: number};

type VictoryChartContainerProps = {
    children: React.ReactNode;
    explicitSize?: ExplicitSize;
    onExpandPress?: () => void;
};

function VictoryChartContainer({children, explicitSize, onExpandPress}: VictoryChartContainerProps) {
    if (explicitSize) {
        return (
            <VictoryChartContainerFixed
                layout={{kind: 'fixed', width: explicitSize.width, height: explicitSize.height}}
                onExpandPress={onExpandPress}
            >
                {children}
            </VictoryChartContainerFixed>
        );
    }

    return <VictoryChartContainerResponsive onExpandPress={onExpandPress}>{children}</VictoryChartContainerResponsive>;
}

VictoryChartContainer.displayName = 'VictoryChartContainer';

export default VictoryChartContainer;
