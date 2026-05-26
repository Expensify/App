import React from 'react';
import {ChartDefaultTypefaceProvider} from '@components/Charts/hooks';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import {VictoryChartProvider} from './context/VictoryChartContext';
import type {VictoryChartRendererProps} from './types';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    return (
        <ChartDefaultTypefaceProvider>
            <VictoryChartProvider tnode={tnode}>
                <VictoryChartContainer>
                    <VictoryChartContent />
                </VictoryChartContainer>
            </VictoryChartProvider>
        </ChartDefaultTypefaceProvider>
    );
}

BaseVictoryChartRenderer.displayName = 'BaseVictoryChartRenderer';

export default BaseVictoryChartRenderer;
