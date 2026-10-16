#!/usr/bin/env bun

/**
 * Lint runner: run a Linter, then each Processor, then a Formatter.
 *
 *   bun scripts/lint/index.ts                      -> lint the whole repo
 *   bun scripts/lint/index.ts src/foo.ts ...       -> lint just the given paths
 *   bun scripts/lint/index.ts --show-warnings ...  -> include grandfathered seatbelt warnings
 *   bun scripts/lint/index.ts --timings            -> print per-stage wall times
 */

import CLI from 'expensify-common/CLI';

import checkOnyxConnectBypass from '../checkOnyxConnectBypass';
import Bench from '../utils/Bench';
import ESLintLinter from './eslint/ESLintLinter';
import StylishFormatter from './formatters/StylishFormatter';
import Pipeline from './LintPipeline';
import ReactCompilerFilter from './processors/ReactCompilerFilter';
import Seatbelt, {resolveSeatbeltOptions} from './processors/Seatbelt';
import StratifyNoDeprecated from './processors/StratifyNoDeprecated';

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

const pipeline = new Pipeline(
    projectRoot,
    new ESLintLinter({
        projectRoot,
        useCache: !cli.flags['no-cache'],
        fix: cli.flags.fix,
    }),
    [new ReactCompilerFilter(), new StratifyNoDeprecated(), new Seatbelt(resolveSeatbeltOptions(projectRoot))],
    new StylishFormatter(projectRoot, cli.flags['show-warnings']),
    bench,
);

const result = await pipeline.run(lintTargets);

if (result.reportText) {
    if (result.exitCode > 1) {
        console.error(result.reportText);
    } else {
        console.log(result.reportText);
    }
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
