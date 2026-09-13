import type GetStaticChartCanvasProps from './types';

/** Native Skia views don't flash on re-composite, so the chart keeps its regular renderer. */
const getStaticChartCanvasProps: GetStaticChartCanvasProps = () => undefined;

export default getStaticChartCanvasProps;
