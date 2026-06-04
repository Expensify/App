import {drawOffscreen, makeOffscreenSurface} from '@shopify/react-native-skia/lib/module/headless';
import type {TNode} from 'react-native-render-html';
import {TRenderEngineProvider} from 'react-native-render-html';
import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import {VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import resolveVictoryChartType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveVictoryChartType';
import VICTORY_HTML_ELEMENT_MODELS from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/victoryHtmlElementModels';
import CliVictoryChartContent from './CliVictoryChartContent';

// react-native-render-html/lib/commonjs/TRenderEngineProvider.js references
// `defaultSystemFonts` in a default parameter, but only imports `_defaultSystemFonts`.
// Passing systemFonts avoids that broken default when Bun bundles the CJS build.
const RENDER_HTML_SYSTEM_FONTS = ['Arial', 'Courier New', 'Georgia'];

type CanvasSize = {
    width: number;
    height: number;
};

async function renderChartToPng(tnode: TNode, fonts: ChartFontsValue, {width, height}: CanvasSize, outPath: string): Promise<void> {
    if (!resolveVictoryChartType(tnode, fonts.typefaces.EXP_NEUE)) {
        throw new Error('Chart XML describes an invalid or mixed chart type');
    }

    const chartElement = (
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

    using surface = makeOffscreenSurface(width, height);
    using image = await drawOffscreen(surface, chartElement);
    const pngBytes = image.encodeToBytes();

    if (!pngBytes) {
        throw new Error('Skia failed to encode the rendered chart to PNG bytes');
    }

    await Bun.write(outPath, pngBytes);
}

export default renderChartToPng;
