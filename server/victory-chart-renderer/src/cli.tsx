import CLI from '@scripts/utils/CLI';
import loadChartFontsForCli from './loadChartFontsForCli';
import parseChartXml from './parseChartXml';
import renderChartToPng from './renderChartToPng';
import resolveCanvasSize from './resolveCanvasSize';

const cli = new CLI({
    positionalArgs: [
        {
            name: 'xmlString',
            description: 'Chart XML string or path to a .xml file',
        },
        {
            name: 'outPath',
            description: 'Path to write the rendered PNG to',
            parse: (val) => {
                if (!val.toLowerCase().endsWith('.png')) {
                    throw new Error('outPath must end with .png');
                }
                return val;
            },
        },
    ],
});

const xmlInput = cli.positionalArgs.xmlString;
const {outPath} = cli.positionalArgs;
const xmlString = xmlInput.endsWith('.xml') ? await Bun.file(xmlInput).text() : xmlInput;
const tnode = parseChartXml(xmlString);
const canvasSize = resolveCanvasSize(tnode);
const fonts = await loadChartFontsForCli();

await renderChartToPng(tnode, fonts, canvasSize, outPath);
