import CLI from 'expensify-common/CLI';

import loadChartFontsForCli from './loadChartFontsForCli';
import parseChartXml from './parseChartXml';
import renderChartToPng from './renderChartToPng';
import resolveCanvasSize from './resolveCanvasSize';

const cli = new CLI({
    namedArgs: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'chart-xml': {
            description: 'Chart XML string (use $(cat path/to/chart.xml) to pass a file)',
        },
        out: {
            description: 'Path to write the rendered PNG to',
            parse: (val) => {
                if (!val.toLowerCase().endsWith('.png')) {
                    throw new Error('--out must end with .png');
                }
                return val;
            },
        },
    },
});

try {
    const xmlString = cli.namedArgs['chart-xml'];
    const outPath = cli.namedArgs.out;
    const tnode = parseChartXml(xmlString);
    const canvasSize = resolveCanvasSize(tnode);
    const fonts = await loadChartFontsForCli();

    await renderChartToPng(tnode, fonts, canvasSize, outPath);

    // Onyx and network modules register listeners/timers during init; exit explicitly so CI smoke tests do not hang.
    process.exit(0);
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
