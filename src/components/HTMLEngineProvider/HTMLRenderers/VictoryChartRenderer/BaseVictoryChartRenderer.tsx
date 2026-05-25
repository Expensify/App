import React from 'react';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import {VictoryChartProvider} from './context/VictoryChartContext';
import type {VictoryChartRendererProps} from './types';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    return (
        <VictoryChartProvider tnode={tnode}>
            <VictoryChartContainer>
                <VictoryChartContent />
            </VictoryChartContainer>
        </VictoryChartProvider>
    );
}

BaseVictoryChartRenderer.displayName = 'BaseVictoryChartRenderer';

export default BaseVictoryChartRenderer;
