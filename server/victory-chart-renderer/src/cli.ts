/* eslint-disable no-restricted-imports */
import {LoadSkiaWeb} from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';
import {JsiSkApi} from '@shopify/react-native-skia/lib/module/skia/web';
import {drawOffscreen, makeOffscreenSurface} from '@shopify/react-native-skia/lib/module/headless';
import CLI from '@scripts/utils/CLI';

const cli = new CLI({
    positionalArgs: [
        {
            name: 'outPath',
            description: 'Path to write the rendered PNG to',
        },
    ],
});

await LoadSkiaWeb();

// The `Skia` named export from `@shopify/react-native-skia` is captured at
// module load time from `globalThis.SkiaApi` (the native bridge on iOS/Android).
// Off-device we have to seed it ourselves before anything imports `victory-native`,
// which calls `Skia.Path.Make()` from inside `useBarPath`.
(globalThis as unknown as {SkiaApi: ReturnType<typeof JsiSkApi>}).SkiaApi = JsiSkApi(
    (globalThis as unknown as {CanvasKit: unknown}).CanvasKit,
);

const [React, victoryNative] = await Promise.all([import('react'), import('victory-native')]);
const {createElement} = React;
const {Bar, CartesianChart} = victoryNative;

const width = 400;
const height = 250;

const data: Array<{x: number; y: number}> = [
    {x: 1, y: 60},
    {x: 2, y: 90},
];

const chartElement = createElement(
    CartesianChart<(typeof data)[number], 'x', 'y'>,
    {
        data,
        xKey: 'x',
        yKeys: ['y'],
        domain: {x: [0, 3], y: [0, 100]},
        domainPadding: {left: 40, right: 40, top: 20, bottom: 20},
        padding: 20,
        explicitSize: {width, height},
        headless: true,
        xAxis: {lineColor: '#111827', lineWidth: 2},
        yAxis: [{yKeys: ['y'], lineColor: '#111827', lineWidth: 2}],
    },
    ({points, chartBounds}) =>
        createElement(Bar, {
            points: points.y,
            chartBounds,
            color: '#4f46e5',
            innerPadding: 0.45,
        }),
);

using surface = makeOffscreenSurface(width, height);
using image = await drawOffscreen(surface, chartElement);
const pngBytes = image.encodeToBytes();
if (!pngBytes) {
    throw new Error('Skia failed to encode the rendered chart to PNG bytes');
}

await Bun.write(cli.positionalArgs.outPath, pngBytes);
