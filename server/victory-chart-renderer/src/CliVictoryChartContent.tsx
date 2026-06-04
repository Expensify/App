import React from 'react';
import VictoryChartCartesian from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartCartesian';
import VictoryChartPolar from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartPolar';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

type CliVictoryChartContentProps = {
    explicitSize: {width: number; height: number};
};

function CliVictoryChartContent({explicitSize}: CliVictoryChartContentProps) {
    const {type} = useVictoryChartContext();

    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return (
                <VictoryChartCartesian
                    explicitSize={explicitSize}
                    headless
                />
            );
        case CHART_TYPE.POLAR:
            return (
                <VictoryChartPolar
                    explicitSize={explicitSize}
                    headless
                />
            );
        default:
            throw new Error('Chart XML describes an invalid or mixed chart type');
    }
}

export default CliVictoryChartContent;
