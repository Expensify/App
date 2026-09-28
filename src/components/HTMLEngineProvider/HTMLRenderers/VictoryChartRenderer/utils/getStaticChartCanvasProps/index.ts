import type GetStaticChartCanvasProps from './types';

/**
 * Web: renders the chart into a plain 2D canvas bitmap and releases the WebGL context right after
 * drawing. A bitmap stays visible through the modal close animation (a live WebGL canvas flashes
 * white when re-composited) and doesn't hold a GPU context per expanded chart.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- prop name is defined by react-native-skia
const getStaticChartCanvasProps: GetStaticChartCanvasProps = () => ({__destroyWebGLContextAfterRender: true});

export default getStaticChartCanvasProps;
