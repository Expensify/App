import React from 'react';
import {ChartFontsProvider} from '@components/Charts/hooks';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import {VictoryChartProvider} from './context/VictoryChartContext';
import type {VictoryChartRendererProps} from './types';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    return (
        <ChartFontsProvider>
            <VictoryChartProvider tnode={tnode}>
                <VictoryChartContainer>
                    <VictoryChartContent />
                </VictoryChartContainer>
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
