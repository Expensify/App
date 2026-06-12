import type {TNode} from '@native-html/render';
import {TRenderEngineProvider} from '@native-html/render';
import React from 'react';
import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import VictoryChartContainerFixed from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContainer/VictoryChartContainerFixed';
import VictoryChartContent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartContent';
import {VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ChartType, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import VICTORY_HTML_ELEMENT_MODELS from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/victoryHtmlElementModels';

// @native-html/render/lib/commonjs/TRenderEngineProvider.js references
// `defaultSystemFonts` in a default parameter, but only imports `_defaultSystemFonts`.
// Passing systemFonts avoids that broken default when Bun bundles the CJS build.
const RENDER_HTML_SYSTEM_FONTS = ['Arial', 'Courier New', 'Georgia'];

type CliVictoryChartProps = {
    tnode: TNode;
    fonts: ChartFontsValue;
    processedResult: ProcessNodeResult;
    type: ChartType;
    width: number;
    height: number;
};

function CliVictoryChart({tnode, fonts, processedResult, type, width, height}: CliVictoryChartProps) {
    const explicitSize = {width, height};
    return (
        <TRenderEngineProvider
            customHTMLElementModels={VICTORY_HTML_ELEMENT_MODELS}
            systemFonts={RENDER_HTML_SYSTEM_FONTS}
        >
            <ChartFontsContext.Provider value={fonts}>
                <VictoryChartProvider
                    tnode={tnode}
                    processedResult={processedResult}
                    type={type}
                >
                    <VictoryChartContainerFixed layout={{kind: 'fixed', width: explicitSize.width, height: explicitSize.height}}>
                        <VictoryChartContent
                            explicitSize={explicitSize}
                            headless
                        />
                    </VictoryChartContainerFixed>
                </VictoryChartProvider>
            </ChartFontsContext.Provider>
        </TRenderEngineProvider>
    );
}

export default CliVictoryChart;
