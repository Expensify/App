// Temporary experiment: runs existing tests/perf-local files, unchanged, on the Hermes CLI and counts CPU instructions per test.
// Usage (from the repo root): node tests/perf-local/icount/runPerfLocalOnHermes.mjs <workDir> <method> <reps> <test file> [more files]
//   method: perf (./icount wrapper, Linux) or mactime (/usr/bin/time -l, macOS)
//   <workDir>/hermes-build/bin/hermes is the Hermes CLI; results go to <workDir>/results/existing-tests.csv and .log
import {spawnSync} from 'node:child_process';
import {appendFileSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';

const [workDir, method, repsArg, ...testFiles] = process.argv.slice(2);
const reps = Number(repsArg);
const RUN_TIMEOUT_MS = 180000;
const MAX_ITERATIONS = 200000;

const METHODS = {
    perf: {wrap: (cmd) => [`${workDir}/icount`, ...cmd], pattern: /icount instructions:u (\d+)/},
    mactime: {wrap: (cmd) => ['/usr/bin/time', '-l', ...cmd], pattern: /(\d+)\s+instructions retired/},
};
const hermes = `${workDir}/hermes-build/bin/hermes`;
const hermesc = resolve('node_modules/hermes-compiler/hermesc', process.platform === 'darwin' ? 'osx-bin' : 'linux64-bin', 'hermesc');
const bundleDir = `${workDir}/existing-out`;
const entryDir = resolve('tests/perf-local/icount/entries');
const resultsFile = `${workDir}/results/existing-tests.csv`;
const logFile = `${workDir}/results/existing-tests.log`;
mkdirSync(bundleDir, {recursive: true});
mkdirSync(entryDir, {recursive: true});
mkdirSync(`${workDir}/results`, {recursive: true});
writeFileSync(resultsFile, 'method,file,test,iterations,variant,rep,count,wallMs\n');
writeFileSync(logFile, '');

function log(message) {
    console.log(message);
    appendFileSync(logFile, `${message}\n`);
}

/** One bytecode file per (test, iterations): the Hermes CLI takes no script arguments, so the choice is compiled in. */
function compileVariant(bundle, name, test, iterations) {
    const source = `${bundleDir}/${name}.variant.js`;
    const bytecode = `${bundleDir}/${name}.${test}.${iterations}.hbc`;
    // ICOUNT_EXTRA_PRELUDE: optional JS run before the bundle, for experiments (for example replacing a noisy native call).
    writeFileSync(source, `globalThis.__ICOUNT = {test: ${test}, iterations: ${iterations}};\n${process.env.ICOUNT_EXTRA_PRELUDE ?? ''}\n${bundle}`);
    const result = spawnSync(hermesc, ['-O', '-emit-binary', '-out', bytecode, source], {encoding: 'utf8'});
    if (result.status !== 0) {
        throw new Error(`hermesc failed: ${(result.stderr ?? '').slice(0, 500)}`);
    }
    return bytecode;
}

function runHermes(bytecode, counted) {
    const [bin, ...args] = counted ? METHODS[method].wrap([hermes, bytecode]) : [hermes, bytecode];
    const startedAt = process.hrtime.bigint();
    const result = spawnSync(bin, args, {encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024});
    const wallMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const count = counted ? METHODS[method].pattern.exec(result.stderr ?? '')?.[1] : undefined;
    return {stdout: result.stdout ?? '', stderr: result.stderr ?? '', wallMs, count, timedOut: result.error?.code === 'ETIMEDOUT'};
}

function describeFailure(run) {
    if (run.timedOut) {
        return 'timed out';
    }
    const error = /icount error ([^\n]*)/.exec(run.stdout)?.[1];
    return (
        error ??
        run.stderr
            .trim()
            .split('\n')
            .find((line) => line.trim()) ??
        run.stdout.trim().split('\n').at(-1) ??
        'no output'
    ).slice(0, 300);
}

for (const testFile of testFiles) {
    const name = basename(testFile).replace(/\.perf-local\.tsx?$/, '');
    const entry = `${entryDir}/${name}.ts`;
    writeFileSync(entry, `import run from '../jestOnHermes';\n\nimport '../../${basename(testFile)}';\n\nrun();\n`);
    const bundleFile = `${bundleDir}/${name}.js`;
    const bundled = spawnSync(process.execPath, ['scripts/bundlePerfTestForHermes.ts', entry, bundleFile], {encoding: 'utf8'});
    if (bundled.status !== 0) {
        log(`FILE FAILED ${name}: bundle: ${(bundled.stderr ?? '').trim().split('\n').slice(0, 3).join(' | ').slice(0, 400)}`);
        continue;
    }
    const bundle = readFileSync(bundleFile, 'utf8');

    let listing;
    try {
        listing = runHermes(compileVariant(bundle, name, -1, 0), false);
    } catch (error) {
        log(`FILE FAILED ${name}: ${error.message}`);
        continue;
    }
    const namesJson = /icount tests (\[.*\])/.exec(listing.stdout)?.[1];
    if (!namesJson) {
        log(`FILE FAILED ${name}: could not load: ${describeFailure(listing)}`);
        continue;
    }
    const testNames = JSON.parse(namesJson);

    for (const [testIndex, testName] of testNames.entries()) {
        const calibration = runHermes(compileVariant(bundle, name, testIndex, -1), false);
        const calls = Number(/icount calibrate (\d+)/.exec(calibration.stdout)?.[1]);
        if (!calls || !calibration.stdout.includes('icount done')) {
            log(`TEST FAILED ${name} | ${testName}: ${describeFailure(calibration)}`);
            continue;
        }
        const iterations = Math.min(calls, MAX_ITERATIONS);
        const variants = {empty: compileVariant(bundle, name, testIndex, 0), full: compileVariant(bundle, name, testIndex, iterations)};
        let failed = false;
        for (let rep = 0; rep < reps && !failed; rep++) {
            for (const [variant, bytecode] of Object.entries(variants)) {
                const run = runHermes(bytecode, true);
                if (!run.stdout.includes('icount done') || !run.count) {
                    log(`TEST FAILED ${name} | ${testName}: ${describeFailure(run)}`);
                    failed = true;
                    break;
                }
                appendFileSync(resultsFile, `${[method, name, JSON.stringify(testName), iterations, variant, rep, run.count, run.wallMs.toFixed(2)].join(',')}\n`);
            }
        }
        rmSync(variants.empty);
        rmSync(variants.full);
        if (!failed) {
            log(`TEST OK ${name} | ${testName} (${iterations} calls)`);
        }
    }
}
