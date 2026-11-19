/**
 * Helpers for bar charts whose series are stacked: grouping the series into stacks, and measuring each stack whole,
 * since a stack reaches the sum of its segments rather than the largest of them.
 */
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

const STACK_TOTAL_KEY_PREFIX = 'stack';

/** Returns the stacked series grouped into their stacks, ordered by stack index, each listing its segments bottom first. Empty when no series is stacked. */
function getSeriesStacks(series: readonly ChartSeries[]): ChartSeries[][] {
    const stacksByIndex = new Map<number, ChartSeries[]>();
    for (const seriesItem of series) {
        if (seriesItem.stackIndex === undefined || seriesItem.isAverage) {
            continue;
        }
        const stack = stacksByIndex.get(seriesItem.stackIndex) ?? [];
        stack.push(seriesItem);
        stacksByIndex.set(seriesItem.stackIndex, stack);
    }
    return [...stacksByIndex.entries()].sort(([first], [second]) => first - second).map(([, stack]) => stack);
}

/** Returns the series standing for each stack's total, keyed like the values `getStackTotalsData` writes */
function getStackTotalSeries(stacks: ChartSeries[][]): ChartSeries[] {
    return stacks.map((stack, position) => ({
        key: `${STACK_TOTAL_KEY_PREFIX}${position}`,
        stackIndex: stack.at(0)?.stackIndex,
    }));
}

/**
 * Returns each point with every stack's segments summed into the stack's total, and averages kept as they are,
 * so the y-axis and the tooltip anchor reach the top of the tallest stack.
 */
function getStackTotalsData(data: ChartDataPoint[], stacks: ChartSeries[][], averageSeries: ChartSeries | undefined): ChartDataPoint[] {
    const totalSeries = getStackTotalSeries(stacks);
    return data.map((point) => {
        const values: Partial<Record<string, number>> = {};
        for (const [position, stack] of stacks.entries()) {
            const segmentValues = stack.flatMap(({key}) => point.values[key] ?? []);
            const totalKey = totalSeries.at(position)?.key;
            if (totalKey && segmentValues.length > 0) {
                values[totalKey] = segmentValues.reduce((sum, value) => sum + value, 0);
            }
        }
        const averageValue = averageSeries && point.values[averageSeries.key];
        if (averageSeries && averageValue !== undefined) {
            values[averageSeries.key] = averageValue;
        }
        return {...point, values};
    });
}

export {getSeriesStacks, getStackTotalsData, getStackTotalSeries};
