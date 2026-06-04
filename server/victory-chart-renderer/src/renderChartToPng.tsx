import {drawOffscreen, makeOffscreenSurface} from '@shopify/react-native-skia/lib/module/headless';
import type {TNode} from 'react-native-render-html';
import {TRenderEngineProvider} from 'react-native-render-html';
import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import {VictoryChartProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import resolveVictoryChartType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveVictoryChartType';
import CliVictoryChartContent from './CliVictoryChartContent';
import {renderEngine} from './parseChartXml';

type CanvasSize = {
    width: number;
    height: number;
};

async function renderChartToPng(tnode: TNode, fonts: ChartFontsValue, {width, height}: CanvasSize, outPath: string): Promise<void> {
    if (!resolveVictoryChartType(tnode, fonts.typefaces.EXP_NEUE)) {
        throw new Error('Chart XML describes an invalid or mixed chart type');
    }

    const chartElement = (
        <TRenderEngineProvider engine={renderEngine}>
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

export type {CanvasSize};
export default renderChartToPng;
