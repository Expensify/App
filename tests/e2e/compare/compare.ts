import type {Unit} from '@libs/E2E/types';
import type {Stats} from '../measure/math';
import getStats from '../measure/math';
import * as math from './math';
import type {Entry} from './output/console';
import printToConsole from './output/console';
import writeToMarkdown from './output/markdown';

type Metric = Record<string, number[]>;

/*
 * base implementation from: https://github.com/callstack/reassure/blob/main/packages/reassure-compare/src/compare.ts
 * This module reads from the baseline and compare files and compares the results.
 * It has a few different output formats:
 * - console: prints the results to the console
 * - markdown: Writes the results in markdown format to a file
 */

/**
 * Probability threshold for considering given difference significant.
 */
const PROBABILITY_CONSIDERED_SIGNIFICANCE = 0.02;

/**
 * Duration threshold (in ms) for treating given difference as significant.
 *
 * This is additional filter, in addition to probability threshold above.
 * Too small duration difference might be result of measurement grain of 1 ms.
 */
const DURATION_DIFF_THRESHOLD_SIGNIFICANCE = 100;

function buildCompareEntry(name: string, compare: Stats, baseline: Stats, unit: Unit): Entry {
    const diff = compare.mean - baseline.mean;
    const relativeDurationDiff = diff / baseline.mean;

    const z = math.computeZ(baseline.mean, baseline.stdev, compare.mean, compare.runs);
    const prob = math.computeProbability(z);

    const isDurationDiffOfSignificance = prob < PROBABILITY_CONSIDERED_SIGNIFICANCE && Math.abs(diff) >= DURATION_DIFF_THRESHOLD_SIGNIFICANCE;

    return {
        unit,
        name,
        baseline,
        current: compare,
        diff,
        relativeDurationDiff,
        isDurationDiffOfSignificance,
    };
}

/**
 * Compare results between baseline and current entries and categorize.
 */
function compareResults(baselineEntries: Metric | string, compareEntries: Metric | string = baselineEntries, metricForTest: Record<string, Unit> = {}) {
    // Unique test scenario names
    const baselineKeys = Object.keys(baselineEntries ?? {});
    const names = Array.from(new Set([...baselineKeys]));

    const compared: Entry[] = [];

    if (typeof compareEntries !== 'string' && typeof baselineEntries !== 'string') {
        names.forEach((name: string) => {
            const current = compareEntries[name];
            const baseline = baselineEntries[name];

            const currentStats = getStats(baseline);
            const deltaStats = getStats(current);

            if (baseline && current) {
                compared.push(buildCompareEntry(name, deltaStats, currentStats, metricForTest[name]));
            }
        });
    }
    const significance = compared.filter((item) => item.isDurationDiffOfSignificance);

    const meaningless = compared.filter((item) => !item.isDurationDiffOfSignificance);

    return {
        significance,
        meaningless,
    };
}

export default (main: Metric | string, delta: Metric | string, outputFile: string, outputFormat = 'all', metricForTest = {}) => {
    // IMPORTANT NOTE: make sure you are passing the main/baseline results first, then the delta/compare results:
    const outputData = compareResults(main, delta, metricForTest);

    if (outputFormat === 'console' || outputFormat === 'all') {
        printToConsole(outputData);
    }

    if (outputFormat === 'markdown' || outputFormat === 'all') {
        return writeToMarkdown(outputFile, outputData);
    }
};
export {compareResults};
