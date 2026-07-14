import {ChartFontsProvider} from '@components/Charts/hooks';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import getVictoryChartTreeTypeface from '@components/Charts/utils/getVictoryChartTreeTypeface';

import Log from '@libs/Log';

import React from 'react';

import type {VictoryChartRendererProps} from './types';

import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartInteractiveContent from './components/VictoryChartInteractiveContent';
import {VictoryChartProvider} from './context/VictoryChartContext';
import processVictoryChartTree from './parsers/processVictoryChartTree';
import resolveVictoryChartType from './utils/resolveVictoryChartType';

function BaseVictoryChartRenderer({tnode}: VictoryChartRendererProps) {
    const fonts = useChartFonts();

    let processedResult;
    try {
        processedResult = processVictoryChartTree(tnode, getVictoryChartTreeTypeface(fonts.typefaces), null);
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
                <VictoryChartContainer>
                    <VictoryChartInteractiveContent />
                </VictoryChartContainer>
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
