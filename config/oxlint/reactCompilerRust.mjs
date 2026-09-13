import path from 'node:path';
import {transformSync} from 'oxc-transform-react';

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

// Upstream makes a Config diagnostic fatal regardless of `panicThreshold` (`should_panic` tests for it
// before consulting the threshold) because it means the options handed to the compiler are wrong,
// which is a bug in this file rather than a finding about the file being linted. It is therefore not
// ignorable: ignoring it would turn a broken ENVIRONMENT into twelve rules that silently report
// nothing on every file in the repo.
const CONFIG_CATEGORY = 'Config';

// Deliberately the same set ESLint leaves off. Each entry maps to a rule in eslint-plugin-react-hooks
// that eslint-config-expensify does not enable, so surfacing it here would be oxlint-only noise
// rather than parity. Gating is the one exception: ESLint does enable `react-hooks/gating`, but a
// Gating diagnostic only exists when the compiler is handed a dynamicGating source, which neither
// tool does, so it reports 0 on both sides and no fixture can prove a rule for it would run. Config
// is not in this list at all, see CONFIG_CATEGORY above.
//
// Ignored because ESLint does not enable the rule each of these corresponds to, so surfacing them
// would be oxlint-only noise rather than parity. Measured over src/ on 2026-09-09: CapitalizedCalls
// fires 74 times across 49 files, Todo 21 across 19, EffectDerivationsOfState 12 across 11, and
// Invariant 2 across 2, while ESLint reports 0 for capitalized-calls, todo,
// no-deriving-state-in-effects and invariant because none of those four rules is switched on. Mapping
// them to rc/* rules would add 109 findings ESLint does not have.
//
// They are not inert, though. Under `panicThreshold: 'all_errors'` any one of them aborts the
// compile, and the abort is what carries the non-fatal categories out of the compiler at all. That is
// why set-state-in-effect surfaces in some files and not others: CapitalizedCalls, at 49 files, is
// the most common reason it escapes.
const IGNORED_CATEGORIES = new Set([
    'CapitalizedCalls',
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

const COMPILATION_SKIPPED_CATEGORIES = new Set(['EffectDependencies', 'IncompatibleLibrary', 'PreserveManualMemo', 'UnsupportedSyntax']);

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
    enableUseKeyedState: false,
    enableVerboseNoSetStateInEffect: false,
    validateExhaustiveEffectDependencies: 'off',
    enableTreatRefLikeIdentifiersAsRefs: true,
};

// Categories are only available inside the formatted `codeframe` string, which is not a public API of
// oxc-transform-react. Hence the exact version pin in package.json, the throw on an unmapped category,
// and the fixtures in oxlint-migration/port-probe/: an upstream rename has to fail loudly.
//
// Three of the twelve categories are `off` in .oxlintrc.json because the Rust compiler cannot be made
// to hand them back at all; the rc/* block there has the reasoning and the numbers.
const CATEGORY_PATTERN = /react-compiler\(([^)]+)\)/;

const cache = new Map();

function getLang(ext) {
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'ts') {
        return 'ts';
    }
    return 'jsx';
}

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
                // `all_errors`, not the `none` default, and this is the only reason rc/* reports
                // anything at all. oxc-transform-react 0.148.0 narrowed `result.errors` to *fatal*
                // React Compiler diagnostics (oxc-project/oxc#26128, tracked as #26318), and
                // `should_panic` in crates/oxc_react_compiler/src/diagnostics.rs answers false
                // unconditionally for `PanicThreshold::None`, so on the default nothing is fatal and
                // the list is always empty. `all_errors` makes every diagnostic fatal, which is
                // currently the only way to read one back. `fatal` is therefore the normal case here
                // rather than a failure, which is why the handling below no longer bails on it.
                //
                // The cost, and it is a real one: a fatal result aborts on the first function that
                // fails to compile and carries only what was accumulated by then, so later functions
                // in the same file are not analyzed on that pass. Findings are revealed iteratively,
                // one function per fix, rather than all at once. `npm run compare-oxlint` prints the
                // per-rule ESLint-only counts every run, so the size of the remaining gap is always
                // on screen rather than silent.
                panicThreshold: 'all_errors',
                flowSuppressions: false,
                // The option oxlint's native react/* rules do not expose, and the reason this module
                // exists: without it the compiler skips every function under an
                // `eslint-disable-next-line react-hooks/exhaustive-deps` comment, and the repo has 228.
                // Lint-only: setting it in config/babel/reactCompilerConfig.js or config/rsbuild/ would
                // change what those 228 comments make the build memoize, i.e. what ships.
                eslintSuppressionRules: [],
                environment: ENVIRONMENT,
            },
        });
    } catch (error) {
        // Malformed options are rejected at the binding rather than reported as a diagnostic, and the
        // message is identical for every file, so swallowing it would make one bad edit to ENVIRONMENT
        // look like a clean repo. Anything file-specific still yields [] and lets oxlint's own parser
        // report the syntax error.
        const message = error instanceof Error ? error.message : String(error);
        if (/is none of these types|ReactCompilerOptions/.test(message)) {
            throw new Error(`oxc-transform-react rejected this module's React Compiler options: ${message}`);
        }
        return [];
    }

    const errors = result.errors ?? [];

    // A config oxc rejects is a bug in this module, not a finding about the file. Fail loudly, the
    // same way an unmapped category does.
    const rejected = errors.find((error) => (error.message ?? '').startsWith('Invalid React Compiler'));
    if (rejected) {
        throw new Error(`oxc-transform-react rejected this module's React Compiler options: ${rejected.message}`);
    }

    // A fatal result carrying no `react-compiler(...)` category means the compiler never got as far
    // as analyzing: a parse failure aborts that way. oxlint's own parser reports the syntax error, so
    // a rule here stays quiet rather than throwing on it.
    if (result.fatal && !errors.some((error) => CATEGORY_PATTERN.test(error.codeframe ?? ''))) {
        return [];
    }

    const diagnostics = [];
    for (const error of errors) {
        const match = CATEGORY_PATTERN.exec(error.codeframe ?? '');
        if (!match) {
            throw new Error(`React Compiler diagnostic with no category in its codeframe (${filename}): ${error.message ?? ''}`);
        }
        const category = match[1];
        if (category === CONFIG_CATEGORY) {
            throw new Error(
                `oxc-transform-react rejected this module's React Compiler options while linting ${filename}: ${error.message ?? ''}. Fix ENVIRONMENT or the reactCompiler options in config/oxlint/reactCompilerRust.mjs.`,
            );
        }
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

function reactCompilerDiagnostics(filename, sourceText) {
    if (!cache.has(filename)) {
        cache.set(filename, analyze(filename, sourceText));
    }
    return cache.get(filename);
}

export {CONFIG_CATEGORY, IGNORED_CATEGORIES, RULE_BY_CATEGORY, reactCompilerDiagnostics};
