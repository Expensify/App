import {extname} from 'node:path';

import {readTextFile, writeTextFile} from './bunFile';

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

type BenchmarkSample = {
    run: number;
    span: string;
    durationMs: number;
};

type BenchmarkMetricResult = {
    samples: number[];
    stats?: BenchmarkStats;
};

type BenchmarkResultTableRow = {
    span: string;
    runs: number;
    average: string;
    p50: string;
    p75: string;
    p90: string;
    p95: string;
    p99: string;
    min: string;
    max: string;
};

type ExportBenchmarkResultsOptions = {
    inputPaths: readonly string[];
    outputPath: string;
};

const BENCHMARK_SAMPLE_HEADER = 'run,span,duration_ms';
const BENCHMARK_RESULTS_HEADER = 'span,runs,average,p50,p75,p90,p95,p99,min,max';

/** Combines raw sample files, calculates per-span statistics, and writes the summary CSV. */
async function exportBenchmarkResults(options: ExportBenchmarkResultsOptions): Promise<BenchmarkResultTableRow[]> {
    if (options.inputPaths.length === 0) {
        throw new Error('At least one benchmark sample file is required.');
    }
    const sampleGroups = await Promise.all(options.inputPaths.map(readBenchmarkSamples));
    const samples = sampleGroups.flat();
    if (samples.length === 0) {
        throw new Error('No benchmark samples were found in the input files.');
    }
    const table = benchmarkResultTable(benchmarkMetrics(samples));
    await writeBenchmarkResults(options.outputPath, table);
    return table;
}

/** Groups samples by span while retaining explicitly requested spans that have no samples. */
function benchmarkMetrics(samples: readonly BenchmarkSample[], spanNames?: readonly string[]): Record<string, BenchmarkMetricResult> {
    const samplesBySpan = new Map<string, number[]>();
    for (const sample of samples) {
        const spanSamples = samplesBySpan.get(sample.span) ?? [];
        spanSamples.push(sample.durationMs);
        samplesBySpan.set(sample.span, spanSamples);
    }

    const metricSpanNames = spanNames ?? [...samplesBySpan.keys()];
    return Object.fromEntries(
        metricSpanNames.map((spanName) => {
            const spanSamples = samplesBySpan.get(spanName) ?? [];
            return [spanName, {samples: spanSamples, stats: spanSamples.length > 0 ? benchmarkStats(spanSamples) : undefined}];
        }),
    );
}

/** Summarizes a non-empty sample set with its average, interpolated percentiles, and range. */
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

/** Formats metrics for console and CSV output, representing spans without samples as `N/A`. */
function benchmarkResultTable(metrics: Readonly<Record<string, BenchmarkMetricResult>>): BenchmarkResultTableRow[] {
    return Object.entries(metrics).map(([span, metric]) => ({
        span,
        runs: metric.samples.length,
        average: metric.stats?.average.toFixed(2) ?? 'N/A',
        p50: metric.stats?.p50.toFixed(2) ?? 'N/A',
        p75: metric.stats?.p75.toFixed(2) ?? 'N/A',
        p90: metric.stats?.p90.toFixed(2) ?? 'N/A',
        p95: metric.stats?.p95.toFixed(2) ?? 'N/A',
        p99: metric.stats?.p99.toFixed(2) ?? 'N/A',
        min: metric.stats?.min.toFixed(2) ?? 'N/A',
        max: metric.stats?.max.toFixed(2) ?? 'N/A',
    }));
}

function writeBenchmarkSamples(outputPath: string, samples: readonly BenchmarkSample[]): Promise<void> {
    return writeBenchmarkCsv(outputPath, benchmarkSamplesCsv(samples));
}

function writeBenchmarkResults(outputPath: string, table: readonly BenchmarkResultTableRow[]): Promise<void> {
    return writeBenchmarkCsv(outputPath, benchmarkResultsCsv(table));
}

/** Reads and validates the exact raw-sample CSV schema produced by the benchmark runner. */
async function readBenchmarkSamples(inputPath: string): Promise<BenchmarkSample[]> {
    const [header, ...rows] = (await readTextFile(inputPath)).trim().split(/\r?\n/);
    if (header !== BENCHMARK_SAMPLE_HEADER) {
        throw new Error(`Invalid benchmark sample header in ${inputPath}. Expected: ${BENCHMARK_SAMPLE_HEADER}`);
    }

    return rows.filter(Boolean).map((row, rowIndex) => {
        const [runValue, span, durationValue, unexpectedValue] = row.split(',');
        const run = Number(runValue);
        const durationMs = Number(durationValue);
        if (unexpectedValue !== undefined || !Number.isSafeInteger(run) || run <= 0 || !span || !Number.isFinite(durationMs)) {
            throw new Error(`Invalid benchmark sample in ${inputPath} on row ${rowIndex + 2}: ${row}`);
        }
        return {run, span, durationMs};
    });
}

function benchmarkResultsOutputPath(sampleOutputPath: string): string {
    const extension = extname(sampleOutputPath);
    const outputPathWithoutExtension = extension ? sampleOutputPath.slice(0, -extension.length) : sampleOutputPath;
    return `${outputPathWithoutExtension}-results.csv`;
}

function benchmarkSamplesCsv(samples: readonly BenchmarkSample[]): string[] {
    return [BENCHMARK_SAMPLE_HEADER, ...samples.map((sample) => [sample.run, sample.span, sample.durationMs].join(','))];
}

function benchmarkResultsCsv(table: readonly BenchmarkResultTableRow[]): string[] {
    return [BENCHMARK_RESULTS_HEADER, ...table.map((row) => [row.span, row.runs, row.average, row.p50, row.p75, row.p90, row.p95, row.p99, row.min, row.max].join(','))];
}

/** Sorts a copy of the samples before calculating a percentile for a fraction between zero and one. */
function percentile(values: readonly number[], fraction: number): number {
    return percentileFromSortedValues(
        values.toSorted((left, right) => left - right),
        fraction,
    );
}

async function writeBenchmarkCsv(outputPath: string, csvRows: readonly string[]): Promise<void> {
    await writeTextFile(outputPath, [...csvRows, ''].join('\n'));
}

/** Calculates a percentile from sorted samples using linear interpolation between adjacent values. */
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

export {
    benchmarkMetrics,
    benchmarkResultTable,
    benchmarkResultsCsv,
    benchmarkResultsOutputPath,
    benchmarkSamplesCsv,
    benchmarkStats,
    exportBenchmarkResults,
    percentile,
    readBenchmarkSamples,
    writeBenchmarkResults,
    writeBenchmarkSamples,
};
export type {BenchmarkMetricResult, BenchmarkResultTableRow, BenchmarkSample, BenchmarkStats, ExportBenchmarkResultsOptions};
