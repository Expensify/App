#!/usr/bin/env bun

/**
 * Lint runner: spawn a linter as a JSON producer, then apply the post-process
 * pipeline (react-compiler filter, no-deprecated stratify, seatbelt ratchet)
 * as pure transforms over the message list.
 *
 *   bun scripts/lint/index.ts                      -> lint the whole repo
 *   bun scripts/lint/index.ts src/foo.ts ...       -> lint just the given paths
 *   bun scripts/lint/index.ts --show-warnings ...  -> include grandfathered seatbelt warnings
 *   bun scripts/lint/index.ts --timings            -> print per-stage wall times
 */

import CLI from 'expensify-common/CLI';

import checkOnyxConnectBypass from '../checkOnyxConnectBypass';
import Bench from '../utils/Bench';
import {runEslint} from './eslint';
import {runPostprocess} from './pipeline';
import {resolveSeatbeltOptions} from './seatbelt';

const projectRoot = `${import.meta.dir}/../..`;

/* CLI argv uses kebab-case for flags documented in help */
/* eslint-disable @typescript-eslint/naming-convention */
const cli = new CLI({
    flags: {
        'no-cache': {
            description: 'Disable the ESLint content cache',
        },
        'show-warnings': {
            description: 'Include grandfathered seatbelt warnings in the report',
        },
        fix: {
            description: 'Apply ESLint auto-fixes',
        },
        timings: {
            description: 'Print per-stage wall times',
        },
    },
    positionalArgs: [
        {
            name: 'targets',
            description: 'Files or directories to lint (default: the whole repo)',
            variadic: true,
            default: ['.'],
        },
    ],
});
/* eslint-enable @typescript-eslint/naming-convention */

const lintTargets = cli.positionalArgs.targets.length > 0 ? cli.positionalArgs.targets : ['.'];
const showTimings = cli.flags.timings || process.env.LINT_TIMINGS === '1';

const bench = new Bench();
const seatbeltOptions = resolveSeatbeltOptions(projectRoot);

const raw = await bench.measure('eslint', () =>
    runEslint({
        projectRoot,
        targets: lintTargets,
        useCache: !cli.flags['no-cache'],
        fix: cli.flags.fix,
    }),
);

const result = await runPostprocess({raw, options: seatbeltOptions, showWarnings: cli.flags['show-warnings'], bench});

if (raw.stderr.trim() && raw.linterExitCode > 1) {
    console.error(raw.stderr.trim());
}

if (result.reportText) {
    console.log(result.reportText);
}

if (showTimings) {
    console.error(bench.format('lint timings'));
}

if (result.exitCode !== 0) {
    process.exit(result.exitCode);
}

if (await checkOnyxConnectBypass(lintTargets)) {
    process.exit(1);
}
