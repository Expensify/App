import {ChartFontsProvider} from '@components/Charts/hooks';
import useChartFonts from '@components/Charts/hooks/useChartFonts';
import getVictoryChartTreeTypeface from '@components/Charts/utils/getVictoryChartTreeTypeface';

import Log from '@libs/Log';

import React from 'react';

import type {VictoryChartRendererProps} from './types';

import VictoryChartContainer from './components/VictoryChartContainer';
import VictoryChartContent from './components/VictoryChartContent';
import {useVictoryChartContext, VictoryChartProvider} from './context/VictoryChartContext';
import processVictoryChartTree from './parsers/processVictoryChartTree';
import resolveVictoryChartType from './utils/resolveVictoryChartType';

/**
 * Passes the chart's known design size straight to victory-native as `explicitSize`. Without it, victory-native
 * only draws chart content once its own `onLayout` measurement fires, which can race with the surrounding
 * chat layout settling (and Skia-web's async WASM mount) and get stuck reporting a stale/zero size — a blank
 * chart until something (remount, resize) forces a fresh measurement. The design size is already known
 * synchronously from the chart's HTML style attributes, so there's nothing to wait for.
 */
function VictoryChartBody() {
    const {chartContentStyles} = useVictoryChartContext();
    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const explicitSize = designWidth !== undefined && designHeight !== undefined ? {width: designWidth, height: designHeight} : undefined;

    return (
        <VictoryChartContainer>
            <VictoryChartContent
                explicitSize={explicitSize}
                headless={false}
            />
        </VictoryChartContainer>
    );
}

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
                <VictoryChartBody />
            </VictoryChartProvider>
        </ChartFontsProvider>
    );
}

export default BaseVictoryChartRenderer;
