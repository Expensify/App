// Temporary experiment: summarises the CSV files written by run.mjs as a markdown table.
// Usage: node analyze.mjs <file.csv> [more.csv ...]
import {existsSync, readFileSync} from 'node:fs';

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = sorted.length >> 1;
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
const percent = (value) => `${(value * 100).toFixed(3)}%`;

console.log('| method | engine | scenario | metric | base net (median) | same-code diff: median | same-code diff: max | head vs base: median | min | max |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const file of process.argv.slice(2)) {
    if (!existsSync(file)) {
        continue;
    }
    const rows = readFileSync(file, 'utf8')
        .trim()
        .split('\n')
        .slice(1)
        .map((line) => {
            const [method, engine, tree, scenario, iters, rep, count, wallMs] = line.split(',');
            return {method, engine, tree, scenario, iters: Number(iters), rep: Number(rep), count: Number(count), wallMs: Number(wallMs)};
        });
    const key = (row) => `${row.method}|${row.engine}|${row.scenario}`;
    for (const group of new Set(rows.map(key))) {
        const groupRows = rows.filter((row) => key(row) === group);
        // Only repeats where all four runs (base/head x 0/20 sorts) finished.
        const repeats = [...new Set(groupRows.map((row) => row.rep))].filter((rep) => groupRows.filter((row) => row.rep === rep).length === 4);
        for (const metric of ['count', 'wallMs']) {
            // Net work of 20 sorts = run with 20 sorts minus run with 0 sorts, which removes startup and data building.
            const net = (tree) =>
                repeats.map((rep) => {
                    const value = (iters) => groupRows.find((row) => row.tree === tree && row.rep === rep && row.iters === iters)[metric];
                    return value(20) - value(0);
                });
            const base = net('base');
            const head = net('head');
            if (base.length < 2 || base.some((value) => value <= 0)) {
                console.log(`| ${group.replaceAll('|', ' | ')} | ${metric} | not usable (zero or missing) | | | | | |`);
                continue;
            }
            const sameCode = base.slice(1).map((value, index) => Math.abs(value / base[index] - 1));
            const change = head.map((value, index) => value / base[index] - 1);
            console.log(
                `| ${group.replaceAll('|', ' | ')} | ${metric} | ${Math.round(median(base))} | ${percent(median(sameCode))} | ${percent(Math.max(...sameCode))} | ${percent(median(change))} | ${percent(Math.min(...change))} | ${percent(Math.max(...change))} |`,
            );
        }
    }
}
