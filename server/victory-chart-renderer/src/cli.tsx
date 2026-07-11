import Log from '@libs/Log';

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

const renderStartedAt = Date.now();

try {
    const xmlString = cli.namedArgs['chart-xml'];
    const outPath = cli.namedArgs.out;
    const tnode = parseChartXml(xmlString);
    const canvasSize = resolveCanvasSize(tnode);
    const fonts = await loadChartFontsForCli();

    await renderChartToPng(tnode, fonts, canvasSize, outPath);

    Log.info('Victory chart rendered successfully', true, {
        outPath,
        width: canvasSize.width,
        height: canvasSize.height,
        durationMs: Date.now() - renderStartedAt,
    });

    // Onyx and network modules register listeners/timers during init; exit explicitly so CI smoke tests do not hang.
    process.exit(0);
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    // Always surface a plain-text error on stderr for local/CLI visibility, independent of
    // whether the rsyslog socket is reachable in this environment.
    console.error(message);
    Log.alert('Victory chart render failed', {
        message,
        stack,
        durationMs: Date.now() - renderStartedAt,
    });
    process.exit(1);
}
