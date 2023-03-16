const _ = require('underscore');

const filterOutliersViaIQR = (data) => {
    let q1;
    let q3;

    const values = data.slice().sort((a, b) => a - b);

    if ((values.length / 4) % 1 === 0) {
        q1 = (1 / 2) * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
        q3 = (1 / 2) * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
    } else {
        q1 = values[Math.floor((values.length / 4) + 1)];
        q3 = values[Math.ceil((values.length * (3 / 4)) + 1)];
    }

    const iqr = q3 - q1;
    const maxValue = q3 + (iqr * 1.5);
    const minValue = q1 - (iqr * 1.5);

    return _.filter(values, x => (x >= minValue) && (x <= maxValue));
};

const mean = arr => _.reduce(arr, (a, b) => a + b, 0) / arr.length;

const std = (arr) => {
    const avg = mean(arr);
    return Math.sqrt(_.reduce(_.map(arr, i => (i - avg) ** 2), (a, b) => a + b) / arr.length);
};

const getStats = (entries) => {
    const cleanedEntries = filterOutliersViaIQR(entries);
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
