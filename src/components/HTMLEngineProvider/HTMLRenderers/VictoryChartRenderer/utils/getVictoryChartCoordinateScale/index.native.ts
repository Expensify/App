/** Native gesture coordinates are already local to the transformed chart view. */
const getVictoryChartCoordinateScale: (layoutScale: number) => number = () => 1;

export default getVictoryChartCoordinateScale;
