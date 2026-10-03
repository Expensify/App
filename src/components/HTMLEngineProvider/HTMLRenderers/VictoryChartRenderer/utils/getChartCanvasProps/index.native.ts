import type GetChartCanvasProps from './types';

/** Native Skia views don't flash on re-composite and aren't scaled through CSS, so the chart keeps its regular renderer. */
const getChartCanvasProps: GetChartCanvasProps = () => undefined;

export default getChartCanvasProps;
