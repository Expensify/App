import React from 'react';
import {CHART_TYPE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import VictoryChart from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/VictoryChart';

function VictoryChartContent() {
    const {type} = useVictoryChartContext();

    switch (type) {
        case CHART_TYPE.CARTESIAN:
            return <VictoryChart.Cartesian />;
        case CHART_TYPE.POLAR:
            return <VictoryChart.Polar />;
    }

    return null;
}

VictoryChartContent.displayName = 'VictoryChartContent';

export default VictoryChartContent;
