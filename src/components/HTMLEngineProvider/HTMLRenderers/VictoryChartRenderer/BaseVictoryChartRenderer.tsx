import React from 'react';
import VictoryChartContainer from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer';
import VictoryChartContent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContent';
import {VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
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
