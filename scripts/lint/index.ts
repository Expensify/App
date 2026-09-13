#!/usr/bin/env bun

/**
 * Lint runner: run a Linter, then each Processor, then a Formatter.
 *
 *   bun scripts/lint/index.ts                      -> lint the whole repo
 *   bun scripts/lint/index.ts src/foo.ts ...       -> lint just the given paths
 *   bun scripts/lint/index.ts --show-warnings ...  -> include grandfathered seatbelt warnings
 *   bun scripts/lint/index.ts --timings            -> print per-stage wall times
 */

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';

import type Linter from './Linter';

import checkOnyxConnectBypass from '../checkOnyxConnectBypass';
import Bench from '../utils/Bench';
import ESLintLinter from './eslint/ESLintLinter';
import JSONFormatter from './formatters/JSONFormatter';
import StylishFormatter from './formatters/StylishFormatter';
import Pipeline from './LintPipeline';
import OxlintLinter from './oxlint/OxlintLinter';
import ReactCompilerFilter from './processors/ReactCompilerFilter';
import Seatbelt, {SEATBELT_TSV_BY_LINTER, resolveSeatbeltOptions} from './processors/Seatbelt';
import StratifyNoDeprecated from './processors/StratifyNoDeprecated';

const projectRoot = `${import.meta.dir}/../..`;

const LINTER_NAMES = ['eslint', 'oxlint'] as const;
type LinterName = TupleToUnion<typeof LINTER_NAMES>;

function isLinterName(value: string): value is LinterName {
    return LINTER_NAMES.some((name) => name === value);
}

function parseLinterName(value: string): LinterName {
    if (!isLinterName(value)) {
        throw new Error(`Unknown linter "${value}". Expected one of: ${LINTER_NAMES.join(', ')}`);
    }
    return value;
}

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
        'no-cache': {
            description: 'Disable the ESLint content cache (no-op under Oxlint, which has none)',
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
    namedArgs: {
        linter: {
            description: `Which linter produces the diagnostics (${LINTER_NAMES.join(' | ')})`,
            default: 'eslint',
            parse: parseLinterName,
        },
        format: {
            description: `How to print the report (${FORMAT_NAMES.join(' | ')})`,
            default: 'stylish',
            parse: parseFormatName,
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

function makeLinter(name: LinterName): Linter {
    if (name === 'oxlint') {
        return new OxlintLinter({projectRoot, fix: cli.flags.fix});
    }
    return new ESLintLinter({
        projectRoot,
        useCache: !cli.flags['no-cache'],
        fix: cli.flags.fix,
    });
}

const pipeline = new Pipeline(
    projectRoot,
    makeLinter(cli.namedArgs.linter),
    [new ReactCompilerFilter(), new StratifyNoDeprecated(), new Seatbelt(resolveSeatbeltOptions(projectRoot, process.env, SEATBELT_TSV_BY_LINTER[cli.namedArgs.linter]))],
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

if (await checkOnyxConnectBypass(lintTargets)) {
    process.exit(1);
}
