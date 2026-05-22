import React from 'react';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import VictoryChartCartesian from './VictoryChartCartesian';
import VictoryChartPolar from './VictoryChartPolar';

function VictoryChartContent() {
    const {type} = useVictoryChartContext();

    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return <VictoryChartCartesian />;
        case CHART_TYPE.POLAR:
            return <VictoryChartPolar />;
        default:
            return null;
    }
}

VictoryChartContent.displayName = 'VictoryChartContent';

export default VictoryChartContent;
