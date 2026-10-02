import type GetChartCanvasProps from './types';

/**
 * Web: the static canvas renders the chart into a plain 2D canvas bitmap and releases the WebGL context
 * right after drawing. A bitmap stays visible through the modal close animation (a live WebGL canvas
 * flashes white when re-composited) and doesn't hold a GPU context per expanded chart.
 *
 * Inline charts are painted through a CSS scale (see VictoryChartContainerFixed), so the backing store
 * follows the painted size. At scale 1 the density is left to Skia, which keeps tracking browser zoom.
 */
const getChartCanvasProps: GetChartCanvasProps = (shouldUseStaticCanvas, layoutScale, devicePixelRatio) => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- prop name is defined by react-native-skia
    ...(shouldUseStaticCanvas ? {__destroyWebGLContextAfterRender: true} : {}),
    ...(layoutScale < 1 ? {pixelDensity: devicePixelRatio * layoutScale} : {}),
});

export default getChartCanvasProps;
