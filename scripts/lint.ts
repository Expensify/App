#!/usr/bin/env bun

/**
 * Run ESLint with the repo's standard flags (memory ceiling, shared content
 * cache, auto concurrency), then finish tightening the eslint-seatbelt baseline.
 * Delegate target selection to the caller:
 *
 *   bun scripts/lint.ts                      -> lint the whole repo
 *   bun scripts/lint.ts src/foo.ts ...       -> lint just the given paths
 *   bun scripts/lint.ts --show-warnings ...  -> include grandfathered seatbelt warnings in the output
 *
 * By default we pass `--quiet` to ESLint so only blocking errors are printed.
 * eslint-seatbelt reclassifies grandfathered violations as warnings, so the
 * default output mirrors what CI cares about. Pass `--show-warnings` to
 * restore the full output (errors + warnings).
 */
import {$, file} from 'bun';
import {SeatbeltArgs, SeatbeltFile} from 'eslint-seatbelt/api';

import checkOnyxConnectBypass from './checkOnyxConnectBypass';

const projectRoot = `${import.meta.dir}/..`;

// parse args
let useCache = true;
let showWarnings = false;
const passthroughArgs: string[] = [];
for (const arg of process.argv.slice(2)) {
    if (arg === '--no-cache') {
        useCache = false;
    } else if (arg === '--show-warnings') {
        showWarnings = true;
    } else {
        passthroughArgs.push(arg);
    }
}

// Preserve default behavior of linting the whole repo when no target is passed.
const lintTargets = passthroughArgs.length > 0 ? passthroughArgs : ['.'];

// Build ESLint args
const eslintArgs: string[] = [];
if (useCache) {
    eslintArgs.push('--cache', '--cache-location=node_modules/.cache/eslint', '--cache-strategy', 'content');
}
if (!showWarnings) {
    eslintArgs.push('--quiet');
}
// Type-aware linting loads the full TypeScript program in every worker (~12GB heap each on a
// cold cache), so hosts with limited memory need fewer workers with a larger heap rather than
// ESLint's auto worker count. Override via ESLINT_CONCURRENCY and NODE_OPTIONS together.
eslintArgs.push(`--concurrency=${process.env.ESLINT_CONCURRENCY ?? 'auto'}`, '--no-warn-ignored', ...lintTargets);

const nodeOptions: string = process.env.NODE_OPTIONS ?? '--max_old_space_size=8192';
const seatbeltFrozenEnv: string = process.env.SEATBELT_FROZEN ?? '0';

// Run ESLint with the repo's default memory ceiling and seatbelt behavior.
const eslintResult = await $`npx eslint ${eslintArgs}`
    .cwd(projectRoot)
    .env({...process.env, NODE_OPTIONS: nodeOptions, SEATBELT_FROZEN: seatbeltFrozenEnv})
    .nothrow();
if (eslintResult.exitCode !== 0) {
    process.exit(eslintResult.exitCode);
}

/** Mirrors eslint-seatbelt's own boolean env var parsing: unset/empty is unset, "0"/"false"/"no" (case-insensitive) is false, anything else is true. */
function readSeatbeltBooleanEnvVar(value: string | undefined): boolean | undefined {
    if (value === undefined || value === '') {
        return undefined;
    }
    return !['0', 'false', 'no'].includes(value.toLowerCase());
}

// eslint-seatbelt only rewrites the row for a file it actually lints, so a deleted or renamed
// file's row is never revisited and lingers in the baseline forever (a dead-code gap in
// eslint-seatbelt itself: https://github.com/justjake/eslint-seatbelt/issues/15). Finish the job
// by dropping rows for files that no longer exist, mirroring the same readOnly default as
// config/eslint/eslint.config.mjs and the same SEATBELT_READ_ONLY/SEATBELT_INCREASE/SEATBELT_DISABLE
// escape hatches eslint-seatbelt itself honors, so pruning never dirties a local worktree.
const seatbeltPath = `${projectRoot}/config/eslint/eslint.seatbelt.tsv`;
const isSeatbeltIncreaseSet = !!process.env.SEATBELT_INCREASE;
const seatbeltArgs = SeatbeltArgs.fromConfig({
    seatbeltFile: seatbeltPath,
    disable: readSeatbeltBooleanEnvVar(process.env.SEATBELT_DISABLE) ?? false,
    frozen: readSeatbeltBooleanEnvVar(seatbeltFrozenEnv) ?? false,
    readOnly: isSeatbeltIncreaseSet ? false : (readSeatbeltBooleanEnvVar(process.env.SEATBELT_READ_ONLY) ?? !process.env.CI),
});
if (!seatbeltArgs.disable) {
    const seatbeltFile = SeatbeltFile.readSync(seatbeltPath);
    const filenames = Array.from(seatbeltFile.filenames());
    const missingFilenames = (await Promise.all(filenames.map(async (filename) => ((await file(filename).exists()) ? undefined : filename)))).filter(
        (filename): filename is string => filename !== undefined,
    );

    let removedCount = 0;
    for (const filename of missingFilenames) {
        if (seatbeltFile.removeFile(filename, seatbeltArgs)) {
            removedCount++;
        }
    }
    if (removedCount > 0) {
        console.log(`eslint-seatbelt: removed ${removedCount} baseline row(s) for deleted files`);
        if (!seatbeltArgs.frozen && !seatbeltArgs.readOnly) {
            seatbeltFile.writeSync();
        }
    }
}

// Fail if a new inline eslint-disable bypasses the Onyx.connect() ban (rulesdir/no-onyx-connect),
// checking the same targets as ESLint above. Reached only when ESLint itself passes.
if (await checkOnyxConnectBypass(lintTargets)) {
    process.exit(1);
}
