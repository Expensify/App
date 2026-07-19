import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

import React from 'react';

import VictoryChartCartesian from './VictoryChartCartesian';
import VictoryChartPolar from './VictoryChartPolar';

type VictoryChartContentProps = {
    explicitSize?: {width: number; height: number};
    headless?: boolean;
};

function VictoryChartContent({explicitSize, headless}: VictoryChartContentProps) {
    const {type} = useVictoryChartContext();
    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return (
                <VictoryChartCartesian
                    explicitSize={explicitSize}
                    headless={headless}
                />
            );
        case CHART_TYPE.POLAR:
            return (
                <VictoryChartPolar
                    explicitSize={explicitSize}
                    headless={headless}
                />
            );
        default:
            return null;
    }
}

VictoryChartContent.displayName = 'VictoryChartContent';

export default VictoryChartContent;
