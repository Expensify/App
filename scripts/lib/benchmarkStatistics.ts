type BenchmarkStats = {
    runs: number;
    average: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
};

function percentileFromSortedValues(sortedValues: readonly number[], fraction: number): number {
    if (fraction < 0 || fraction > 1) {
        throw new Error(`Percentile fraction must be between 0 and 1. Received: ${fraction}`);
    }
    if (sortedValues.length === 0) {
        throw new Error('Cannot calculate a percentile without benchmark samples.');
    }

    const position = (sortedValues.length - 1) * fraction;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    const remainder = position - lowerIndex;
    const lowerValue = sortedValues.at(lowerIndex);
    const upperValue = sortedValues.at(upperIndex);
    if (lowerValue === undefined || upperValue === undefined) {
        throw new Error('Cannot calculate a percentile without benchmark samples.');
    }
    return lowerValue + remainder * (upperValue - lowerValue);
}

function percentile(values: readonly number[], fraction: number): number {
    return percentileFromSortedValues(
        values.toSorted((left, right) => left - right),
        fraction,
    );
}

function benchmarkStats(samples: readonly number[]): BenchmarkStats {
    const sortedValues = samples.toSorted((left, right) => left - right);
    const min = sortedValues.at(0);
    const max = sortedValues.at(-1);
    if (min === undefined || max === undefined) {
        throw new Error('No benchmark samples were recorded.');
    }

    return {
        runs: samples.length,
        average: samples.reduce((sum, value) => sum + value, 0) / samples.length,
        p50: percentileFromSortedValues(sortedValues, 0.5),
        p75: percentileFromSortedValues(sortedValues, 0.75),
        p90: percentileFromSortedValues(sortedValues, 0.9),
        p95: percentileFromSortedValues(sortedValues, 0.95),
        p99: percentileFromSortedValues(sortedValues, 0.99),
        min,
        max,
    };
}

export {benchmarkStats, percentile};
export type {BenchmarkStats};
