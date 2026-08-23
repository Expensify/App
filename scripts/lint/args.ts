import CLI from 'expensify-common/CLI';

import type {SeatbeltOptions, SeatbeltRuleSet} from './types';

const SEATBELT_TSV_RELATIVE = 'config/eslint/eslint.seatbelt.tsv';

type LintCliArgs = {
    useCache: boolean;
    showWarnings: boolean;
    fix: boolean;
    dumpRawPath: string | undefined;
    fromRawPath: string | undefined;
    showTimings: boolean;
    lintTargets: string[];
};

/**
 * Mirrors eslint-seatbelt's boolean env parsing: unset/empty is unset, "0"/"false"/"no"
 * (case-insensitive) is false, anything else is true.
 */
function readBooleanEnvVar(value: string | undefined): boolean | undefined {
    if (value === undefined || value === '') {
        return undefined;
    }
    return !['0', 'false', 'no'].includes(value.toLowerCase());
}

/**
 * Mirrors eslint-seatbelt's rule-set env parsing: unset is unset, empty is [],
 * "all"/"1"/"true" is "all", otherwise a whitespace-or-comma-separated list.
 */
function parseRuleSetEnvVar(value: string | undefined): SeatbeltRuleSet | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (!value) {
        return new Set();
    }
    const lower = value.toLowerCase();
    if (lower === 'all' || lower === '1' || lower === 'true') {
        return 'all';
    }
    return new Set(value.split(/[\s,]+/g).filter(Boolean));
}

function parseCliArgs(): LintCliArgs {
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
        namedArgs: {
            'dump-raw': {
                description: 'Write unprocessed linter JSON to this path and stop',
                required: false,
            },
            'from-raw': {
                description: 'Skip ESLint and post-process a captured dump instead',
                required: false,
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
    return {
        useCache: !cli.flags['no-cache'],
        showWarnings: cli.flags['show-warnings'],
        fix: cli.flags.fix,
        dumpRawPath: cli.namedArgs['dump-raw'],
        fromRawPath: cli.namedArgs['from-raw'],
        showTimings: cli.flags.timings || (readBooleanEnvVar(process.env.LINT_TIMINGS) ?? false),
        lintTargets,
    };
}

/**
 * Seatbelt env/config, matching `scripts/lint.ts` + `config/eslint/eslint.config.mjs`:
 * - `SEATBELT_FROZEN` defaults to false (the wrapper forces `0` so `CI=true` does not freeze).
 * - `readOnly` defaults to `!CI`; `SEATBELT_INCREASE` forces writes.
 */
function resolveSeatbeltOptions(projectRoot: string, env: NodeJS.ProcessEnv = process.env): SeatbeltOptions {
    const allowIncreaseRules = parseRuleSetEnvVar(env.SEATBELT_INCREASE) ?? new Set();
    const isIncreaseSet = allowIncreaseRules === 'all' || allowIncreaseRules.size > 0;
    return {
        seatbeltFile: `${projectRoot}/${SEATBELT_TSV_RELATIVE}`,
        projectRoot,
        disable: readBooleanEnvVar(env.SEATBELT_DISABLE) ?? false,
        frozen: readBooleanEnvVar(env.SEATBELT_FROZEN) ?? false,
        readOnly: isIncreaseSet ? false : (readBooleanEnvVar(env.SEATBELT_READ_ONLY) ?? !env.CI),
        allowIncreaseRules,
        keepRules: parseRuleSetEnvVar(env.SEATBELT_KEEP) ?? new Set(),
        quiet: readBooleanEnvVar(env.SEATBELT_QUIET) ?? false,
        verbose: readBooleanEnvVar(env.SEATBELT_VERBOSE) ?? false,
    };
}

export {parseCliArgs, parseRuleSetEnvVar, readBooleanEnvVar, resolveSeatbeltOptions, SEATBELT_TSV_RELATIVE};
export type {LintCliArgs};
