"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareResults = compareResults;
var math_1 = require("../measure/math");
var math = require("./math");
var console_1 = require("./output/console");
var markdown_1 = require("./output/markdown");
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
var PROBABILITY_CONSIDERED_SIGNIFICANCE = 0.02;
/**
 * Duration threshold (in ms) for treating given difference as significant.
 *
 * This is additional filter, in addition to probability threshold above.
 * Too small duration difference might be result of measurement grain of 1 ms.
 */
var DURATION_DIFF_THRESHOLD_SIGNIFICANCE = 100;
var LowerIsBetter = {
    ms: true,
    MB: true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '%': true,
    renders: true,
    FPS: false,
};
function buildCompareEntry(name, compare, baseline, unit) {
    var diff = compare.mean - baseline.mean;
    var relativeDurationDiff = diff / baseline.mean;
    var z = math.computeZ(baseline.mean, baseline.stdev, compare.mean, compare.runs);
    var prob = math.computeProbability(z);
    var isDurationDiffOfSignificance = prob < PROBABILITY_CONSIDERED_SIGNIFICANCE && Math.abs(diff) >= DURATION_DIFF_THRESHOLD_SIGNIFICANCE;
    return {
        unit: unit,
        name: name,
        baseline: baseline,
        current: compare,
        diff: diff,
        relativeDurationDiff: LowerIsBetter[unit] ? relativeDurationDiff : -relativeDurationDiff,
        isDurationDiffOfSignificance: isDurationDiffOfSignificance,
    };
}
/**
 * Compare results between baseline and current entries and categorize.
 */
function compareResults(baselineEntries, compareEntries, metricForTest) {
    if (compareEntries === void 0) { compareEntries = baselineEntries; }
    if (metricForTest === void 0) { metricForTest = {}; }
    // Unique test scenario names
    var baselineKeys = Object.keys(baselineEntries !== null && baselineEntries !== void 0 ? baselineEntries : {});
    var names = Array.from(new Set(__spreadArray([], baselineKeys, true)));
    var compared = [];
    if (typeof compareEntries !== 'string' && typeof baselineEntries !== 'string') {
        names.forEach(function (name) {
            var current = compareEntries[name];
            var baseline = baselineEntries[name];
            var currentStats = (0, math_1.default)(baseline);
            var deltaStats = (0, math_1.default)(current);
            if (baseline && current) {
                compared.push(buildCompareEntry(name, deltaStats, currentStats, metricForTest[name]));
            }
        });
    }
    var significance = compared.filter(function (item) { return item.isDurationDiffOfSignificance; });
    var meaningless = compared.filter(function (item) { return !item.isDurationDiffOfSignificance; });
    return {
        significance: significance,
        meaningless: meaningless,
    };
}
exports.default = (function (main, delta, _a) {
    var outputDir = _a.outputDir, _b = _a.outputFormat, outputFormat = _b === void 0 ? 'all' : _b, _c = _a.metricForTest, metricForTest = _c === void 0 ? {} : _c, skippedTests = _a.skippedTests;
    // IMPORTANT NOTE: make sure you are passing the main/baseline results first, then the delta/compare results:
    var outputData = compareResults(main, delta, metricForTest);
    if (outputFormat === 'console' || outputFormat === 'all') {
        (0, console_1.default)(outputData, skippedTests);
    }
    if (outputFormat === 'markdown' || outputFormat === 'all') {
        return (0, markdown_1.default)(outputDir, outputData, skippedTests);
    }
});
