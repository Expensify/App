const _ = require('underscore');
const {DROP_WORST} = require('../config');

// Simple outlier removal, where we remove at the head and tail entries
const filterOutliers = (data) => {
    // Copy the values, rather than operating on references to existing values
    const values = [...data].sort();
    const removePerSide = Math.ceil(DROP_WORST / 2);
    values.splice(0, removePerSide);
    values.splice(values.length - removePerSide);
    return values;
};
const mean = arr => _.reduce(arr, (a, b) => a + b, 0) / arr.length;

const std = (arr) => {
    const avg = mean(arr);
    return Math.sqrt(_.reduce(_.map(arr, i => (i - avg) ** 2), (a, b) => a + b) / arr.length);
};

const getStats = (entries) => {
    const cleanedEntries = filterOutliers(entries);
    const meanDuration = mean(cleanedEntries);
    const stdevDuration = std(cleanedEntries);

    return {
        mean: meanDuration,
        stdev: stdevDuration,
        runs: cleanedEntries.length,
        entries: cleanedEntries,
    };
};

module.exports = {
    getStats,
};
