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
    passthroughArgs: string[];
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

function parseCliArgs(argv: string[]): LintCliArgs {
    let useCache = true;
    let showWarnings = false;
    let fix = false;
    let dumpRawPath: string | undefined;
    let fromRawPath: string | undefined;
    let showTimings = readBooleanEnvVar(process.env.LINT_TIMINGS) ?? false;
    const passthroughArgs: string[] = [];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv.at(i);
        if (arg === '--no-cache') {
            useCache = false;
        } else if (arg === '--show-warnings') {
            showWarnings = true;
        } else if (arg === '--fix') {
            fix = true;
        } else if (arg === '--timings') {
            showTimings = true;
        } else if (arg === '--dump-raw') {
            dumpRawPath = argv.at(++i);
            if (!dumpRawPath) {
                throw new Error('--dump-raw requires a file path');
            }
        } else if (arg?.startsWith('--dump-raw=')) {
            dumpRawPath = arg.slice('--dump-raw='.length);
        } else if (arg === '--from-raw') {
            fromRawPath = argv.at(++i);
            if (!fromRawPath) {
                throw new Error('--from-raw requires a file path');
            }
        } else if (arg?.startsWith('--from-raw=')) {
            fromRawPath = arg.slice('--from-raw='.length);
        } else if (arg !== undefined) {
            passthroughArgs.push(arg);
        }
    }

    const lintTargets = passthroughArgs.length > 0 ? passthroughArgs : ['.'];
    return {useCache, showWarnings, fix, dumpRawPath, fromRawPath, showTimings, lintTargets, passthroughArgs};
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
