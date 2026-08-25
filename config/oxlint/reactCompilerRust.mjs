// Runs the React Compiler's lint analysis in Rust, so oxlint does not have to pay for the
// JavaScript one.
//
// A BRIDGE, not a destination. oxlint already ships this analysis as native `react/*` rules, and
// they are free. They are also unusable here: they refuse to report anything for a function
// containing an `// eslint-disable-next-line react-hooks/exhaustive-deps` comment, and the repo has
// 228 of those. `oxc-transform-react` exposes the switch that turns that bail-out off
// (`eslintSuppressionRules: []`) and oxlint's rules do not, so we call the compiler ourselves. The
// day oxlint exposes that option, this module and config/oxlint/plugins/rc-rules.mjs collapse into
// twelve `react/*` lines in .oxlintrc.json and zero Node analysis.
//
// What it replaces: 12 `eslint-plugin-react-hooks` v7 rules that analyze nothing themselves -- each
// one filters the compiler's diagnostics down to its own category. Running the compiler in JavaScript
// once per file cost 52 s of a 121 s whole-repo run; the Rust compiler does the same 6891 files in
// 5.2 s.
//
// Parity with the sidecar is the whole point, so `ENVIRONMENT` mirrors the environment the ESLint
// plugin hands the compiler, at
// node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js:51779
// (`COMPILER_OPTIONS`), rather than a hand-picked minimal set. Measured 2026-08-21 over `git
// ls-files src`: the mirrored environment and a trimmed one holding only the six validators our 12
// categories need produce the SAME 366 locations for those categories. The mirror is kept because
// it is what ESLint actually runs, and the extra validators only add categories the allowlist below
// drops (CapitalizedCalls, EffectDerivationsOfState).
//
// The category names come out of a formatted `codeframe` string, which is not a public API. That is
// why `oxc-transform-react` is pinned to an exact version in package.json, why an unrecognized
// category throws here, and why the 12 fixtures in oxlint-migration/port-probe/ exist: a rename
// upstream has to fail loudly, not quietly stop reporting.
//
// MUST NOT be used from the build. `outputMode: 'lint'` analyzes and emits nothing, and
// `eslintSuppressionRules: []` must stay out of config/babel/reactCompilerConfig.js and
// config/rsbuild/: those 228 comments currently stop the build's compiler from memoizing those
// functions, so switching the option on there would change what ships, not what lints.
import path from 'node:path';
import {transformSync} from 'oxc-transform-react';

/**
 * Compiler category to the `eslint-plugin-react-hooks` rule that reports it, which is also our
 * `rc/<name>`. One-to-one, taken from `getRuleForCategoryImpl` in the plugin
 * (cjs/eslint-plugin-react-hooks.development.js:18095) rather than guessed, and re-proven by the
 * fixtures.
 */
const RULE_BY_CATEGORY = {
    Refs: 'refs',
    EffectSetState: 'set-state-in-effect',
    RenderSetState: 'set-state-in-render',
    PreserveManualMemo: 'preserve-manual-memoization',
    Immutability: 'immutability',
    StaticComponents: 'static-components',
    UseMemo: 'use-memo',
    Globals: 'globals',
    ErrorBoundaries: 'error-boundaries',
    Purity: 'purity',
    IncompatibleLibrary: 'incompatible-library',
    UnsupportedSyntax: 'unsupported-syntax',
};

/**
 * Every remaining category in the plugin's `ErrorCategory` enum, i.e. the ones that map to rules
 * this repo does not enable. Listed by name rather than ignored by default, so a category that is
 * NOT in either table -- a rename, or one added by an `oxc-transform-react` bump -- throws instead
 * of silently becoming zero findings for a rule we do enforce.
 *
 * `Config` and `Gating` are here because they are the two checks with no rc/* rule: both would need
 * the whole 52 s JavaScript run to reach the compiler, and neither can fire in this repo, which passes
 * it no `gating`/`dynamicGating` options and no per-rule options for the config validator to reject.
 */
const IGNORED_CATEGORIES = new Set([
    'CapitalizedCalls',
    'Config',
    'EffectDependencies',
    'EffectDerivationsOfState',
    'EffectExhaustiveDependencies',
    'FBT',
    'Gating',
    'Hooks',
    'Invariant',
    'MemoDependencies',
    'Suppression',
    'Syntax',
    'Todo',
    'VoidUseMemo',
]);

/** Categories the plugin prints under `Compilation Skipped:` instead of `Error:`. */
const COMPILATION_SKIPPED_CATEGORIES = new Set(['EffectDependencies', 'IncompatibleLibrary', 'PreserveManualMemo', 'UnsupportedSyntax']);

/**
 * The environment the ESLint plugin runs the compiler with, plus one addition:
 * `enableTreatRefLikeIdentifiersAsRefs`, which config/babel/reactCompilerConfig.js sets, so the
 * analysis matches the code we ship. Measured 2026-08-21 over `git ls-files src`: adding it changes
 * nothing (473 locations either way), so it costs no divergence from the sidecar today.
 */
const ENVIRONMENT = {
    validateRefAccessDuringRender: true,
    validateNoSetStateInRender: true,
    validateNoSetStateInEffects: true,
    // The plugin spells this `validateNoJSXInTryStatements`; oxc spells it with a lowercase `sx`.
    validateNoJsxInTryStatements: true,
    validateNoImpureFunctionsInRender: true,
    validateStaticComponents: true,
    validateNoFreezingKnownMutableFunctions: true,
    validateNoVoidUseMemo: true,
    validateNoCapitalizedCalls: [],
    validateHooksUsage: true,
    validateNoDerivedComputationsInEffects: true,
    // The plugin's three lint feature flags, all off in v7.1.1 (same file, lines 51712 to 51714).
    enableUseKeyedState: false,
    enableVerboseNoSetStateInEffect: false,
    validateExhaustiveEffectDependencies: 'off',
    enableTreatRefLikeIdentifiersAsRefs: true,
};

const CATEGORY_PATTERN = /react-compiler\(([^)]+)\)/;

/** filename -> [{ruleName, loc, message}], so 12 rules asking about one file run one analysis. */
const cache = new Map();

/** Same mapping config/reactCompiler/checkWithOxc.mjs uses, kept identical on purpose. */
function getLang(ext) {
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'ts') {
        return 'ts';
    }
    return 'jsx';
}

/**
 * Byte offset to an ESLint `loc` point: 1-based line, 0-based column. Copied from
 * config/reactCompiler/checkWithOxc.mjs. Not cosmetic -- oxlint-migration/compareFullRepo.py matches
 * findings on (rule, file, LINE), so an off-by-one here reads as a total parity failure.
 */
function offsetToPoint(source, offset) {
    let line = 1;
    let column = 0;
    for (let index = 0; index < offset; index++) {
        if (source[index] === '\n') {
            line += 1;
            column = 0;
        } else {
            column += 1;
        }
    }
    return {line, column};
}

/**
 * The message text ESLint shows, minus its trailing code frame: `printErrorMessage` in the plugin
 * emits the summary, then the description, then a frame that oxlint renders itself.
 */
function buildMessage(category, error) {
    const heading = COMPILATION_SKIPPED_CATEGORIES.has(category) ? 'Compilation Skipped' : 'Error';
    const summary = `${heading}: ${error.message ?? 'Unknown compiler error'}`;
    return error.helpMessage ? `${summary}\n\n${error.helpMessage}.` : summary;
}

function analyze(filename, sourceText) {
    let result;
    try {
        result = transformSync(filename, sourceText, {
            lang: getLang(path.extname(filename).slice(1)),
            reactCompiler: {
                target: '19',
                outputMode: 'lint',
                panicThreshold: 'none',
                // The plugin reads Flow suppressions itself and passes false; this repo has none.
                flowSuppressions: false,
                // The one option oxlint's native react/* rules do not expose, and the reason this
                // module exists: without it the compiler skips every function under an
                // `eslint-disable-next-line react-hooks/exhaustive-deps` comment.
                eslintSuppressionRules: [],
                environment: ENVIRONMENT,
            },
        });
    } catch {
        // A file the compiler refuses outright. oxlint reports the reason itself, so the analysis
        // contributing nothing is correct; crashing the lint run is not.
        return [];
    }

    // A parse failure: `fatal` is set and the only diagnostics are the parser's, which carry no
    // `react-compiler(...)` category. oxlint reports the same parse error from its own front end.
    if (result.fatal) {
        return [];
    }

    const diagnostics = [];
    for (const error of result.errors ?? []) {
        const match = CATEGORY_PATTERN.exec(error.codeframe ?? '');
        if (!match) {
            throw new Error(`React Compiler diagnostic with no category in its codeframe (${filename}): ${error.message ?? ''}`);
        }
        const category = match[1];
        if (IGNORED_CATEGORIES.has(category)) {
            continue;
        }
        const ruleName = RULE_BY_CATEGORY[category];
        if (!ruleName) {
            throw new Error(
                `Unknown React Compiler category '${category}' in ${filename}. oxc-transform-react likely renamed or added one: map it in RULE_BY_CATEGORY or IGNORED_CATEGORIES in config/oxlint/reactCompilerRust.mjs.`,
            );
        }
        const label = error.labels?.[0];
        diagnostics.push({
            ruleName,
            loc: {
                start: offsetToPoint(sourceText, label?.start ?? 0),
                end: offsetToPoint(sourceText, label?.end ?? label?.start ?? 0),
            },
            message: buildMessage(category, error),
        });
    }
    return diagnostics;
}

/** Every enforced diagnostic in a file, computed once per file and cached. */
function reactCompilerDiagnostics(filename, sourceText) {
    if (!cache.has(filename)) {
        cache.set(filename, analyze(filename, sourceText));
    }
    return cache.get(filename);
}

export {IGNORED_CATEGORIES, RULE_BY_CATEGORY, reactCompilerDiagnostics};
