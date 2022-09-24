const _ = require('underscore');
const {DROP_WORST} = require('../../config');

const sortAndClean = (entries) => {
    // Drop the worst measurements outliers (usually warm up runs)
    entries.sort((first, second) => second - first); // DESC
    return entries.slice(DROP_WORST);
};
const mean = arr => _.reduce(arr, (a, b) => a + b, 0) / arr.length;

const std = (arr) => {
    const avg = mean(arr);
    return Math.sqrt(_.reduce(_.map(arr, i => (i - avg) ** 2), (a, b) => a + b) / arr.length);
};

const getStats = (entries) => {
    const cleanedEntries = sortAndClean(entries);
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
