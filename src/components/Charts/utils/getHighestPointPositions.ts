import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

import type {Scale} from 'victory-native';

/** Returns the canvas x and y of each point. The y is the highest series', so the tooltip above it never covers another one. */
function getHighestPointPositions(data: ChartDataPoint[], series: readonly ChartSeries[], xScale: Scale, yScale: Scale): [number[], number[]] {
    return [data.map((point, index) => xScale(index)), data.map((point) => yScale(Math.max(...series.flatMap(({key}) => point.values[key] ?? []))))];
}

export default getHighestPointPositions;
