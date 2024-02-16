/*
 * Base implementation from: https://github.com/callstack/reassure/blob/main/packages/reassure-compare/src/compare.ts
 */

/**
 * Calculate z-score for given baseline and current performance results.
 *
 * Based on :: https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
 *
 * @param {Number} baselineMean
 * @param {Number} baselineStdev
 * @param {Number} currentMean
 * @param {Number} runs
 * @returns {Number}
 */
const computeZ = (baselineMean, baselineStdev, currentMean, runs) => {
    if (baselineStdev === 0) {
        return 1000;
    }

    return Math.abs((currentMean - baselineMean) / (baselineStdev / Math.sqrt(runs)));
};

/**
 * Compute statistical hypothesis probability based on z-score.
 *
 * Based on :: https://github.com/v8/v8/blob/master/test/benchmarks/csuite/compare-baseline.py
 *
 * @param {Number} z
 * @returns {Number}
 */
const computeProbability = (z) => {
    // p 0.005: two sided < 0.01
    if (z > 2.575829) {
        return 0;
    }

    // p 0.010
    if (z > 2.326348) {
        return 0.01;
    }

    // p 0.015
    if (z > 2.170091) {
        return 0.02;
    }

    // p 0.020
    if (z > 2.053749) {
        return 0.03;
    }

    // p 0.025: two sided < 0.05
    if (z > 1.959964) {
        return 0.04;
    }

    // p 0.030
    if (z > 1.880793) {
        return 0.05;
    }

    // p 0.035
    if (z > 1.81191) {
        return 0.06;
    }

    // p 0.040
    if (z > 1.750686) {
        return 0.07;
    }

    // p 0.045
    if (z > 1.695397) {
        return 0.08;
    }

    // p 0.050: two sided < 0.10
    if (z > 1.644853) {
        return 0.09;
    }

    // p 0.100: two sided < 0.20
    if (z > 1.281551) {
        return 0.1;
    }

    // two sided p >= 0.20
    return 0.2;
};

module.exports = {
    computeZ,
    computeProbability,
};
