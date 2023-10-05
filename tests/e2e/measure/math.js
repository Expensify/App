const _ = require('underscore');

const filterOutliersViaIQR = (data) => {
    let q1;
    let q3;

    const values = data.slice().sort((a, b) => a - b);

    if ((values.length / 4) % 1 === 0) {
        q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1]);
        q3 = (1 / 2) * (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1]);
    } else {
        q1 = values[Math.floor(values.length / 4 + 1)];
        q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
    }

    const iqr = q3 - q1;
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    return _.filter(values, (x) => x >= minValue && x <= maxValue);
};

const mean = (arr) => _.reduce(arr, (a, b) => a + b, 0) / arr.length;

const std = (arr) => {
    const avg = mean(arr);
    return Math.sqrt(
        _.reduce(
            _.map(arr, (i) => (i - avg) ** 2),
            (a, b) => a + b,
        ) / arr.length,
    );
};

const getStats = (entries) => {
    // TBD I don't think outliers should be discarded. On certain data sets such as user collection it might make sense.
    // But in theory the app is a defined system. Discarting outliers will effectively hide extreme cases where app might hang
    // or be stuck in a race condition
    // const cleanedEntries = filterOutliersViaIQR(entries);
    const meanDuration = mean(entries);
    const stdevDuration = std(entries);

    return {
        mean: meanDuration,
        stdev: stdevDuration,
        runs: entries.length,
        entries,
    };
};

module.exports = {
    getStats,
};
