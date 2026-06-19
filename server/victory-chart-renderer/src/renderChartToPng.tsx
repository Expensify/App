import {drawOffscreen, makeOffscreenSurface} from '@shopify/react-native-skia/lib/module/headless';
import type {TNode} from 'react-native-render-html';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import resolveVictoryChartType from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveVictoryChartType';
import CliVictoryChart from './components/CliVictoryChart';
import type CanvasSize from './types/CanvasSize';

async function renderChartToPng(tnode: TNode, fonts: ChartFontsValue, {width, height}: CanvasSize, outPath: string): Promise<void> {
    const processedResult = processVictoryChartTree(tnode, fonts.typefaces.EXP_NEUE, null);
    const type = resolveVictoryChartType(processedResult.data);

    if (!type) {
        throw new Error('Chart XML describes an invalid or mixed chart type');
    }

    const chartElement = (
        <CliVictoryChart
            tnode={tnode}
            fonts={fonts}
            processedResult={processedResult}
            type={type}
            width={width}
            height={height}
        />
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
