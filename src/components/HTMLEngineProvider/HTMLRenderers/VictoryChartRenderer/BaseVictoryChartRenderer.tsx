import React, {useState} from 'react';
import {ChartFontsProvider} from '@components/Charts/hooks';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import VictoryChartFullscreenModal from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartFullscreenModal';
import Log from '@libs/Log';
import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import {VictoryChartProvider} from './context/VictoryChartContext';
import processVictoryChartTree from './parsers/processVictoryChartTree';
import type {VictoryChartRendererProps} from './types';
import resolveVictoryChartType from './utils/resolveVictoryChartType';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    const fonts = useChartFonts();
    const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

    let processedResult;
    try {
        processedResult = processVictoryChartTree(tnode, fonts.typefaces.EXP_NEUE, null);
    } catch (error) {
        // Malformed chart HTML can make a parser throw. Fail closed (render nothing) instead of crashing the whole report.
        Log.warn('[VictoryChartRenderer] Failed to process chart tree from malformed HTML', {error});
        return null;
    }

    const type = resolveVictoryChartType(processedResult.data);
    if (!type) {
        Log.warn('Trying to render an invalid chart (empty or mixed chart types).');
        return null;
    }

    return (
        <ChartFontsProvider value={fonts}>
            <VictoryChartProvider
                tnode={tnode}
                processedResult={processedResult}
                type={type}
            >
                <VictoryChartContainer onExpandPress={() => setIsFullscreenVisible(true)}>
                    <VictoryChartContent />
                </VictoryChartContainer>
                <VictoryChartFullscreenModal
                    isVisible={isFullscreenVisible}
                    onClose={() => setIsFullscreenVisible(false)}
                />
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
