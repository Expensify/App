type Entries = number[];

type Stats = {
    mean: number;
    stdev: number;
    runs: number;
    entries: Entries;
};

const filterOutliersViaIQR = (data: Entries): Entries => {
    let q1;
    let q3;

    const values = data.slice().sort((a, b) => a - b);

    if ((values.length / 4) % 1 === 0) {
        q1 = (1 / 2) * ((values.at(values.length / 4) ?? 0) + (values.at(values.length / 4 + 1) ?? 0));
        q3 = (1 / 2) * ((values.at(values.length * (3 / 4)) ?? 0) + (values.at(values.length * (3 / 4) + 1) ?? 0));
    } else {
        q1 = values.at(Math.floor(values.length / 4 + 1)) ?? 0;
        q3 = values.at(Math.ceil(values.length * (3 / 4) + 1)) ?? 0;
    }

    const iqr = q3 - q1;
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    return values.filter((x) => x >= minValue && x <= maxValue);
};

const mean = (arr: Entries): number => arr.reduce((a, b) => a + b, 0) / arr.length;

const std = (arr: Entries): number => {
    const avg = mean(arr);
    return Math.sqrt(arr.map((i) => (i - avg) ** 2).reduce((a, b) => a + b) / arr.length);
};

const getStats = (entries: Entries): Stats => {
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

export default getStats;
export type {Stats};
