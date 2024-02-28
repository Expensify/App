import type {Stats} from '../measure/math';
import getStats from '../measure/math';
import * as math from './math';
import printToConsole from './output/console';
import writeToMarkdown from './output/markdown';

type Entry = {
    name: string;
    baseline?: Stats;
    current?: Stats;
    diff?: number;
    relativeDurationDiff?: number;
    isDurationDiffOfSignificance?: boolean;
    mean?: number;
};

type Result = {
    name: string;
    current?: Entry;
    baseline?: Entry;
};

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

function buildCompareEntry(name: string, compare: Stats, baseline: Stats): Entry {
    const diff = compare.mean - baseline.mean;
    const relativeDurationDiff = diff / baseline.mean;

    const z = math.computeZ(baseline.mean, baseline.stdev, compare.mean, compare.runs);
    const prob = math.computeProbability(z);

    const isDurationDiffOfSignificance = prob < PROBABILITY_CONSIDERED_SIGNIFICANCE && Math.abs(diff) >= DURATION_DIFF_THRESHOLD_SIGNIFICANCE;

    return {
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
function compareResults(compareEntries: Record<string, Entry>, baselineEntries: Record<string, Entry>) {
    // Unique test scenario names
    const names: string[] = [...new Set([...Object(compareEntries).keys(), ...Object(baselineEntries ?? {}).keys()])];

    const compared: Entry[] = [];
    const added: Result[] = [];
    const removed: Result[] = [];

    names.forEach((name: string) => {
        const current = compareEntries[name];
        const baseline = baselineEntries[name];

        const currentStats = getStats(baseline);
        const deltaStats = getStats(current);

        if (baseline && current) {
            compared.push(buildCompareEntry(name, deltaStats, currentStats));
        } else if (current) {
            added.push({
                name,
                current,
            });
        } else if (baseline) {
            removed.push({
                name,
                baseline,
            });
        }
    });

    const significance = compared.filter((item) => item.isDurationDiffOfSignificance);

    const meaningless = compared.filter((item) => !item.isDurationDiffOfSignificance);

    added.sort((a, b) => (b?.current?.mean ?? 0) - (a.current?.mean ?? 0));
    removed.sort((a, b) => (b.baseline?.mean ?? 0) - (a.baseline?.mean ?? 0));

    return {
        significance,
        meaningless,
        added,
        removed,
    };
}

export default (main: Record<string, Entry>, delta: Record<string, Entry>, outputFile: string, outputFormat = 'all') => {
    // IMPORTANT NOTE: make sure you are passing the delta/compare results first, then the main/baseline results:
    const outputData = compareResults(delta, main);

    if (outputFormat === 'console' || outputFormat === 'all') {
        printToConsole(outputData);
    }

    if (outputFormat === 'markdown' || outputFormat === 'all') {
        return writeToMarkdown(outputFile, outputData);
    }
};

export type {Entry};
