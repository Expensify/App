// Temporary experiment: runs single native string/Intl calls in a loop on the Hermes CLI and reports how much the
// instruction count differs between identical runs. Finds calls whose native implementation does not do steady work.
// Usage: node probeNativeCalls.mjs <workDir> <method: perf | mactime> [runs]
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const [workDir, method, runsArg = '6'] = process.argv.slice(2);
const METHODS = {
    perf: {wrap: (cmd) => [`${workDir}/icount`, ...cmd], pattern: /icount instructions:u (\d+)/},
    mactime: {wrap: (cmd) => ['/usr/bin/time', '-l', ...cmd], pattern: /(\d+)\s+instructions retired/},
};
const PROBES = {
    empty: `print('x');`,
    toLowerCase: `var n = 0; for (var i = 0; i < 50000; i++) { n += ('Some Name ' + i + ' User@Example.com').toLowerCase().length; } print(n);`,
    toLocaleLowerCase: `var n = 0; for (var i = 0; i < 50000; i++) { n += ('Some Name ' + i + ' User@Example.com').toLocaleLowerCase().length; } print(n);`,
    toLocaleUpperCase: `var n = 0; for (var i = 0; i < 50000; i++) { n += ('Some Name ' + i + ' User@Example.com').toLocaleUpperCase().length; } print(n);`,
    localeCompare: `var n = 0; for (var i = 0; i < 50000; i++) { n += ('Some Name ' + i).localeCompare('Some Name ' + (i + 1)); } print(n);`,
    collatorCompare: `var c = new Intl.Collator('en'); var n = 0; for (var i = 0; i < 50000; i++) { n += c.compare('Some Name ' + i, 'Some Name ' + (i + 1)); } print(n);`,
    normalize: `var n = 0; for (var i = 0; i < 50000; i++) { n += ('S\\u00f8me N\\u00e1me ' + i).normalize('NFD').length; } print(n);`,
    dateLocalGetters: `var n = 0; for (var i = 0; i < 50000; i++) { n += new Date(i * 34560000).getHours(); } print(n);`,
    numberFormat: `var f = new Intl.NumberFormat('en', {style: 'currency', currency: 'USD'}); var n = 0; for (var i = 0; i < 20000; i++) { n += f.format(i * 1.5).length; } print(n);`,
    toLocaleString: `var n = 0; for (var i = 0; i < 5000; i++) { n += (i * 1.5).toLocaleString('en').length; } print(n);`,
    dateTimeFormat: `var f = new Intl.DateTimeFormat('en', {dateStyle: 'medium', timeStyle: 'short'}); var n = 0; for (var i = 0; i < 20000; i++) { n += f.format(new Date(i * 34560000)).length; } print(n);`,
};

const dir = `${workDir}/probes`;
mkdirSync(dir, {recursive: true});
console.log('| native call | lowest count | highest count | spread |');
console.log('|---|---|---|---|');
for (const [name, source] of Object.entries(PROBES)) {
    const file = `${dir}/${name}.js`;
    writeFileSync(file, source);
    const counts = [];
    let failure;
    for (let run = 0; run < Number(runsArg); run++) {
        const [bin, ...args] = METHODS[method].wrap([`${workDir}/hermes-build/bin/hermes`, file]);
        const result = spawnSync(bin, args, {encoding: 'utf8'});
        const count = METHODS[method].pattern.exec(result.stderr ?? '')?.[1];
        if (result.status !== 0 || !count) {
            failure = (result.stderr ?? '').trim().split('\n')[0]?.slice(0, 120) || 'no count';
            break;
        }
        counts.push(Number(count));
    }
    if (failure) {
        console.log(`| ${name} | did not run: ${failure} | | |`);
        continue;
    }
    const lowest = Math.min(...counts);
    const highest = Math.max(...counts);
    console.log(`| ${name} | ${lowest} | ${highest} | ${((highest / lowest - 1) * 100).toFixed(3)}% |`);
}
