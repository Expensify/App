const fs = require('fs/promises');
const fsSync = require('fs');
const _ = require('underscore');
const {OUTPUT_DIR} = require('../config');
const {
    computeProbability,
    computeZ,
} = require('./math');
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
const DURATION_DIFF_THRESHOLD_SIGNIFICANCE = 50;

const loadFile = path => fs.readFile(path, 'utf8')
    .then((data) => {
        const entries = JSON.parse(data);

        const result = {};
        entries.forEach((entry) => {
            result[entry.name] = entry;
        });

        return result;
    });

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

        if (baseline && current) {
            compared.push(buildCompareEntry(name, current, baseline));
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
        .filter(item => item.isDurationDiffOfSignificance)
        .sort((a, b) => b.diff - a.diff)
        .value();
    const meaningless = _.chain(compared)
        .filter(item => !item.isDurationDiffOfSignificance)
        .sort((a, b) => b.diff - a.diff)
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

module.exports = (
    baselineFile = `${OUTPUT_DIR}/baseline.json`,
    compareFile = `${OUTPUT_DIR}/compare.json`,
    outputFormat = 'all',
) => {
    const hasBaselineFile = fsSync.existsSync(baselineFile);
    if (!hasBaselineFile) {
        throw new Error(
            `Baseline results files "${baselineFile}" does not exists.`,
        );
    }
    return loadFile(baselineFile)
        .then((baseline) => {
            const hasCompareFile = fsSync.existsSync(compareFile);
            if (!hasCompareFile) {
                throw new Error(
                    `Compare results files "${compareFile}" does not exists.`,
                );
            }
            return loadFile(compareFile)
                .then((compare) => {
                    const outputData = compareResults(compare, baseline);

                    if (outputFormat === 'console' || outputFormat === 'all') {
                        printToConsole(outputData);
                    }
                    if (outputFormat === 'markdown' || outputFormat === 'all') {
                        return writeToMarkdown(`${OUTPUT_DIR}/output.md`, outputData);
                    }
                });
        });
};
