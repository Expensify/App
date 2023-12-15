const _ = require('underscore');
const {computeProbability, computeZ} = require('./math');
const {getStats} = require('../measure/math');
const printToConsole = require('./output/console');
const writeToMarkdown = require('./output/markdown');

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

/**
 *
 * @param {string} name
 * @param {Object} compare
 * @param {Object} baseline
 * @returns {Object}
 */
function buildCompareEntry(name, compare, baseline) {
    const diff = compare.mean - baseline.mean;
    const relativeDurationDiff = diff / baseline.mean;

    const z = computeZ(baseline.mean, baseline.stdev, compare.mean, compare.runs);
    const prob = computeProbability(z);

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
 *
 * @param {Object} compareEntries
 * @param {Object} baselineEntries
 * @returns {Object}
 */
function compareResults(compareEntries, baselineEntries) {
    // Unique test scenario names
    const names = [...new Set([..._.keys(compareEntries), ..._.keys(baselineEntries || {})])];

    const compared = [];
    const added = [];
    const removed = [];

    names.forEach((name) => {
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

    const significance = _.chain(compared)
        .filter((item) => item.isDurationDiffOfSignificance)
        .value();
    const meaningless = _.chain(compared)
        .filter((item) => !item.isDurationDiffOfSignificance)
        .value();

    added.sort((a, b) => b.current.mean - a.current.mean);
    removed.sort((a, b) => b.baseline.mean - a.baseline.mean);

    return {
        significance,
        meaningless,
        added,
        removed,
    };
}

module.exports = (main, delta, outputFile, outputFormat = 'all') => {
    const outputData = compareResults(main, delta);

    if (outputFormat === 'console' || outputFormat === 'all') {
        printToConsole(outputData);
    }

    if (outputFormat === 'markdown' || outputFormat === 'all') {
        return writeToMarkdown(outputFile, outputData);
    }
};
