import React from 'react';
import VictoryChartCartesian from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartCartesian';
import VictoryChartPolar from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartPolar';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';

function VictoryChartContent() {
    const {type} = useVictoryChartContext();

    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return <VictoryChartCartesian />;
        case CHART_TYPE.POLAR:
            return <VictoryChartPolar />;
    }

    return null;
}

VictoryChartContent.displayName = 'VictoryChartContent';

export default VictoryChartContent;
