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
                <View style={styles.pRelative}>
                    <VictoryChartContainer>
                        <VictoryChartContent />
                    </VictoryChartContainer>
                    <VictoryChartExpandButton
                        onPress={() => openChart({tnode, processedResult, type, fonts})}
                    />
                </View>
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
