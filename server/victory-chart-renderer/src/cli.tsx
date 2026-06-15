import CLI from '@scripts/utils/CLI';
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

const xmlString = cli.namedArgs['chart-xml'];
const outPath = cli.namedArgs.out;
const tnode = parseChartXml(xmlString);
const canvasSize = resolveCanvasSize(tnode);
const fonts = await loadChartFontsForCli();

await renderChartToPng(tnode, fonts, canvasSize, outPath);
