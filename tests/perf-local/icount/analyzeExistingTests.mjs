// Temporary experiment: summarises existing-tests.csv (written by runPerfLocalOnHermes.mjs) as a markdown table.
// Usage: node analyzeExistingTests.mjs <existing-tests.csv> [existing-tests.log]
import {existsSync, readFileSync} from 'node:fs';

const [csvFile, logFile] = process.argv.slice(2);

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = sorted.length >> 1;
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
const percent = (value) => `${(value * 100).toFixed(3)}%`;

const rows = readFileSync(csvFile, 'utf8')
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
        // The test name is a JSON string and may contain commas, so read the fixed fields from both ends.
        const parts = line.split(',');
        const [wallMs, count, rep, variant, iterations] = parts.slice(-5).reverse();
        return {file: parts[1], test: JSON.parse(parts.slice(2, -5).join(',')), iterations: Number(iterations), variant, rep: Number(rep), count: Number(count), wallMs: Number(wallMs)};
    });

const summary = [];
for (const test of new Set(rows.map((row) => row.test))) {
    const testRows = rows.filter((row) => row.test === test);
    const repeats = [...new Set(testRows.map((row) => row.rep))].filter((rep) => testRows.filter((row) => row.rep === rep).length === 2);
    if (repeats.length < 3) {
        continue;
    }
    const net = (metric) =>
        repeats.map((rep) => testRows.find((row) => row.rep === rep && row.variant === 'full')[metric] - testRows.find((row) => row.rep === rep && row.variant === 'empty')[metric]);
    const spread = (values) => values.slice(1).map((value, index) => Math.abs(value / values[index] - 1));
    const counts = net('count');
    const walls = net('wallMs');
    summary.push({
        test,
        iterations: testRows[0].iterations,
        perCall: median(counts) / testRows[0].iterations,
        countMedian: median(spread(counts)),
        countMax: Math.max(...spread(counts)),
        wallMedian: median(spread(walls)),
        wallMax: Math.max(...spread(walls)),
    });
}

console.log('| test | calls per run | instructions per call | same-code diff, instructions: median | max | same-code diff, wall time: median | max |');
console.log('|---|---|---|---|---|---|---|');
for (const item of summary.sort((a, b) => b.countMax - a.countMax)) {
    console.log(
        `| ${item.test} | ${item.iterations} | ${Math.round(item.perCall)} | ${percent(item.countMedian)} | ${percent(item.countMax)} | ${percent(item.wallMedian)} | ${percent(item.wallMax)} |`,
    );
}
const under = (limit) => summary.filter((item) => item.countMax < limit).length;
console.log(`\nTests measured: ${summary.length}. Worst same-code diff under 0.1%: ${under(0.001)}, under 0.5%: ${under(0.005)}, under 1%: ${under(0.01)}.`);
console.log(
    `Median over tests of the worst same-code diff: instructions ${percent(median(summary.map((item) => item.countMax)))}, wall time ${percent(median(summary.map((item) => item.wallMax)))}.`,
);
if (logFile && existsSync(logFile)) {
    const failures = readFileSync(logFile, 'utf8')
        .split('\n')
        .filter((line) => line.includes('FAILED'));
    console.log(`\nDid not run (${failures.length}):\n${failures.map((line) => `- ${line}`).join('\n')}`);
}
