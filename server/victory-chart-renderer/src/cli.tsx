import {drawOffscreen, makeOffscreenSurface} from '@shopify/react-native-skia/lib/module/headless';
import {JsiSkApi} from '@shopify/react-native-skia/lib/module/skia/web';
import {LoadSkiaWeb} from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';
import CLI from '@scripts/utils/CLI';

const cli = new CLI({
    namedArgs: {
        outPath: {
            description: 'Path to write the rendered PNG to',
            parse: (val) => {
                if (!val.toLowerCase().endsWith('.png')) {
                    throw new Error('outPath must end with .png');
                }
                return val;
            },
        },
    },
});

await LoadSkiaWeb();

// The `Skia` named export from `@shopify/react-native-skia` is captured at
// module load time from `globalThis.SkiaApi` (the native bridge on iOS/Android).
// Off-device we have to seed it ourselves before anything imports `victory-native`,
// which calls `Skia.Path.Make()` from inside `useBarPath`.
const globalScope = globalThis as unknown as {CanvasKit: Parameters<typeof JsiSkApi>[0]; SkiaApi: ReturnType<typeof JsiSkApi>};
globalScope.SkiaApi = JsiSkApi(globalScope.CanvasKit);

const {Bar, CartesianChart} = await import('victory-native');

type ChartDatum = {x: number; y: number};

const width = 400;
const height = 250;

const data: ChartDatum[] = [
    {x: 1, y: 60},
    {x: 2, y: 90},
];

const chartElement = (
    <CartesianChart<ChartDatum, 'x', 'y'>
        data={data}
        xKey="x"
        yKeys={['y']}
        domain={{x: [0, 3], y: [0, 100]}}
        domainPadding={{left: 40, right: 40, top: 20, bottom: 20}}
        padding={20}
        explicitSize={{width, height}}
        headless
        xAxis={{lineColor: '#111827', lineWidth: 2}}
        yAxis={[{yKeys: ['y'], lineColor: '#111827', lineWidth: 2}]}
    >
        {({points, chartBounds}) => (
            <Bar
                points={points.y}
                chartBounds={chartBounds}
                color="#4f46e5"
                innerPadding={0.45}
            />
        )}
    </CartesianChart>
);

using surface = makeOffscreenSurface(width, height);
using image = await drawOffscreen(surface, chartElement);
const pngBytes = image.encodeToBytes();
if (!pngBytes) {
    throw new Error('Skia failed to encode the rendered chart to PNG bytes');
}

await Bun.write(cli.namedArgs.outPath, pngBytes);
