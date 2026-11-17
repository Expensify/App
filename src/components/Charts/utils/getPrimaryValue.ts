import type {ChartDataPoint} from '@components/Charts/types';

/** A point's amount for the chart's primary series */
function getPrimaryValue(point: ChartDataPoint, primarySeriesKey: string): number {
    return point.values[primarySeriesKey] ?? 0;
}

export default getPrimaryValue;
