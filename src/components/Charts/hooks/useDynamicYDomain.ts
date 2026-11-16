import type {ChartDataPoint} from '@components/Charts/types';

/** Keep zero inside the Y-axis domain so bars always grow from a visible baseline, also when all values are negative */
function useDynamicYDomain(data: ChartDataPoint[]): [number, number] {
    const values = data.flatMap((point) => Object.values(point.values).filter((value) => value !== undefined));
    return [Math.min(0, ...values), Math.max(0, ...values)];
}

export default useDynamicYDomain;
