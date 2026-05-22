import React from 'react';
import type {VictoryChartRendererProps} from './types';
import VictoryChart from './VictoryChart';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    return (
        <VictoryChart.Provider tnode={tnode}>
            <VictoryChart.Container>
                <VictoryChart.Cartesian />
                <VictoryChart.Polar />
            </VictoryChart.Container>
        </VictoryChart.Provider>
    );
}

BaseVictoryChartRenderer.displayName = 'BaseVictoryChartRenderer';

export default BaseVictoryChartRenderer;
