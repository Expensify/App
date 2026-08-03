/** Web gesture coordinates reflect the transformed layout and must be mapped back to the chart's design space. */
const getVictoryChartCoordinateScale: (layoutScale: number) => number = (layoutScale) => layoutScale;

export default getVictoryChartCoordinateScale;
