import React from 'react';
import type {TNode} from 'react-native-render-html';
import {TRenderEngineProvider} from 'react-native-render-html';
import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import {VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import VICTORY_HTML_ELEMENT_MODELS from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/victoryHtmlElementModels';
import CliVictoryChartContent from './CliVictoryChartContent';

// react-native-render-html/lib/commonjs/TRenderEngineProvider.js references
// `defaultSystemFonts` in a default parameter, but only imports `_defaultSystemFonts`.
// Passing systemFonts avoids that broken default when Bun bundles the CJS build.
const RENDER_HTML_SYSTEM_FONTS = ['Arial', 'Courier New', 'Georgia'];

type CliVictoryChartProps = {
    tnode: TNode;
    fonts: ChartFontsValue;
    width: number;
    height: number;
};

function CliVictoryChart({tnode, fonts, width, height}: CliVictoryChartProps) {
    return (
        <TRenderEngineProvider
            customHTMLElementModels={VICTORY_HTML_ELEMENT_MODELS}
            systemFonts={RENDER_HTML_SYSTEM_FONTS}
        >
            <ChartFontsContext.Provider value={fonts}>
                <VictoryChartProvider tnode={tnode}>
                    <CliVictoryChartContent explicitSize={{width, height}} />
                </VictoryChartProvider>
            </ChartFontsContext.Provider>
        </TRenderEngineProvider>
    );
}

export default CliVictoryChart;
