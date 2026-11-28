// Temporary experiment: runs the fixed-work sort benchmark many times and records, per run, a work count and wall time.
// Usage: node run.mjs <workDir> <out.csv> <method> <reps> [engines]
//   method: perf (hardware instruction counter via ./icount), valgrind (simulated instruction count), mactime (macOS, local test)
//   <workDir>/out holds the bundles, <workDir>/hermes-build/bin/hermes the Hermes CLI, <workDir>/icount the counter wrapper.
import {spawnSync} from 'node:child_process';
import {appendFileSync, writeFileSync} from 'node:fs';

const [workDir, outFile, method, repsArg, enginesArg = 'hermes'] = process.argv.slice(2);
const reps = Number(repsArg);
const ITERATIONS = [0, 20];
const REPORTS = 15000;
const SCENARIOS = ['acc30-default', 'acc30-focus', 'ascii-default'];

const METHODS = {
    perf: {wrap: (cmd) => [`${workDir}/icount`, ...cmd], pattern: /icount instructions:u (\d+)/},
    valgrind: {wrap: (cmd) => ['valgrind', '--tool=cachegrind', '--cache-sim=no', '--cachegrind-out-file=/dev/null', ...cmd], pattern: /I\s+refs:\s+([\d,]+)/},
    mactime: {wrap: (cmd) => ['/usr/bin/time', '-l', ...cmd], pattern: /(\d+)\s+instructions retired/},
};
const ENGINES = {
    hermes: (bundle) => [`${workDir}/hermes-build/bin/hermes`, `${workDir}/out/${bundle}.hbc`],
    node: (bundle) => ['node', `${workDir}/out/${bundle}.js`],
};

const {wrap, pattern} = METHODS[method];
writeFileSync(outFile, 'method,engine,tree,scenario,iters,rep,count,wallMs\n');
for (let rep = 0; rep < reps; rep++) {
    for (const engine of enginesArg.split(',')) {
        for (const scenario of SCENARIOS) {
            for (const iters of ITERATIONS) {
                // Base and head take turns inside every repeat, so slow drift of the machine hits both the same.
                for (const tree of rep % 2 ? ['head', 'base'] : ['base', 'head']) {
                    const [bin, ...args] = wrap(ENGINES[engine](`${tree}-${scenario}-${iters}`));
                    const startedAt = process.hrtime.bigint();
                    const result = spawnSync(bin, args, {encoding: 'utf8'});
                    const wallMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
                    if (!result.stdout?.includes(`checksum ${iters * REPORTS}`)) {
                        throw new Error(`Benchmark did not finish: ${bin} ${args.join(' ')}\n${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${(result.stderr ?? '').slice(-2000)}`);
                    }
                    const match = pattern.exec(result.stderr);
                    if (!match) {
                        // The benchmark ran but the counter gave nothing: this method does not work on this machine.
                        console.log(`METHOD UNSUPPORTED (${method}): ${(result.stderr ?? '').trim().split('\n').slice(-3).join(' | ')}`);
                        process.exit(0);
                    }
                    const count = match[1].replaceAll(',', '');
                    appendFileSync(outFile, `${[method, engine, tree, scenario, iters, rep, count, wallMs.toFixed(2)].join(',')}\n`);
                }
            }
        }
    }
}
console.log(`${method}: wrote ${outFile}`);
