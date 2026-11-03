#!/usr/bin/env bun

/**
 * Lint runner: run oxlint, then each Processor, then a Formatter.
 *
 *   bun scripts/lint/index.ts                      -> lint the whole repo
 *   bun scripts/lint/index.ts src/foo.ts ...       -> lint just the given paths
 *   bun scripts/lint/index.ts --show-warnings ...  -> include grandfathered seatbelt warnings
 *   bun scripts/lint/index.ts --shards=4           -> split the JS plugins across 4 oxlint processes
 *   bun scripts/lint/index.ts --timings            -> print per-stage wall times
 */

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';

import checkOnyxLintBypass from '../checkOnyxLintBypass';
import checkOnyxLintDisableReason from '../checkOnyxLintDisableReason';
import Bench from '../utils/Bench';
import JSONFormatter from './formatters/JSONFormatter';
import StylishFormatter from './formatters/StylishFormatter';
import Pipeline from './LintPipeline';
import OxlintLinter from './oxlint/OxlintLinter';
import ReactCompilerFilter from './processors/ReactCompilerFilter';
import Seatbelt, {resolveSeatbeltOptions} from './processors/Seatbelt';
import StratifyNoDeprecated from './processors/StratifyNoDeprecated';

const projectRoot = `${import.meta.dir}/../..`;

const FORMAT_NAMES = ['stylish', 'json'] as const;
type FormatName = TupleToUnion<typeof FORMAT_NAMES>;

function isFormatName(value: string): value is FormatName {
    return FORMAT_NAMES.some((name) => name === value);
}

function parseFormatName(value: string): FormatName {
    if (!isFormatName(value)) {
        throw new Error(`Unknown format "${value}". Expected one of: ${FORMAT_NAMES.join(', ')}`);
    }
    return value;
}

/* CLI argv uses kebab-case for flags documented in help */
/* eslint-disable @typescript-eslint/naming-convention */
const cli = new CLI({
    flags: {
        'show-warnings': {
            description: 'Include grandfathered seatbelt warnings in the report',
        },
        fix: {
            description: 'Apply oxlint auto-fixes',
        },
        timings: {
            description: 'Print per-stage wall times',
        },
    },
    namedArgs: {
        format: {
            description: `How to print the report (${FORMAT_NAMES.join(' | ')})`,
            default: 'stylish',
            parse: parseFormatName,
        },
        shards: {
            description: 'Processes to fan the JS plugins across, a positive integer or `auto` (by cores and free memory)',
            default: 'auto',
            parse: (value: string) => value,
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
    new OxlintLinter({projectRoot, fix: cli.flags.fix, shards: cli.namedArgs.shards}),
    [new ReactCompilerFilter(), new StratifyNoDeprecated(), new Seatbelt(resolveSeatbeltOptions(projectRoot, process.env))],
    cli.namedArgs.format === 'json' ? new JSONFormatter() : new StylishFormatter(projectRoot, cli.flags['show-warnings']),
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

const onyxChecksFailed = await Promise.all([checkOnyxLintBypass(lintTargets), checkOnyxLintDisableReason(lintTargets)]);

if (onyxChecksFailed.some(Boolean)) {
    process.exit(1);
}
