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

// Upstream makes a Config diagnostic fatal regardless of `panicThreshold` because it means the
// options handed to the compiler are wrong. Not ignorable: a broken ENVIRONMENT would otherwise
// become twelve rules that silently report nothing on every file.
const CONFIG_CATEGORY = 'Config';

// ESLint does not enable the rule behind each of these, so surfacing them would be oxlint-only
// noise. They are not inert: under `panicThreshold: 'all_errors'` any one of them aborts the
// compile, and the abort is what carries the non-fatal categories out of the compiler at all.
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
// oxc-transform-react. Hence the exact version pin in package.json and the throw on an unmapped
// category: an upstream rename has to fail loudly.
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

function utf8Length(code) {
    if (code < 0x80) {
        return 1;
    }
    if (code < 0x800) {
        return 2;
    }
    // A lone surrogate is three bytes too: it is replaced with U+FFFD on the way into Rust, so the
    // source oxc measured is the same width either way.
    if (code < 0x10000) {
        return 3;
    }
    return 4;
}

// `label.start`/`label.end` are UTF-8 *byte* offsets into the source oxc parsed, while a JavaScript
// string is indexed in UTF-16 code units. Indexing `sourceText` with one directly overshoots by one
// unit for every extra byte, which drifts across newlines in any file holding non-ASCII (281 of
// src/'s .tsx files do), so a diagnostic would anchor on the wrong line and an
// `eslint-disable-next-line` on the right line would stop suppressing it. This maps a byte offset
// back to the line and UTF-16 column oxlint's `loc` expects. Built once per file rather than per
// diagnostic, hence the closure.
function buildOffsetToPoint(source) {
    // Byte and UTF-16 offset of the start of each line, both indexed by line - 1.
    const lineBytes = [0];
    const lineUnits = [0];
    let byte = 0;
    for (let unit = 0; unit < source.length; ) {
        const code = source.codePointAt(unit);
        byte += utf8Length(code);
        unit += code > 0xffff ? 2 : 1;
        if (code === 0x0a) {
            lineBytes.push(byte);
            lineUnits.push(unit);
        }
    }

    return function offsetToPoint(offset) {
        // The last line starting at or before `offset`. An offset past the end of the source clamps
        // to the final line rather than running off it.
        let low = 0;
        let high = lineBytes.length - 1;
        while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            if (lineBytes[mid] <= offset) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        // Walked rather than subtracted: a column is UTF-16 code units, not bytes.
        let byteInLine = lineBytes[low];
        let unit = lineUnits[low];
        while (byteInLine < offset && unit < source.length) {
            const code = source.codePointAt(unit);
            byteInLine += utf8Length(code);
            unit += code > 0xffff ? 2 : 1;
        }
        return {line: low + 1, column: unit - lineUnits[low]};
    };
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
                // `all_errors`, not the `none` default: oxc-transform-react 0.148.0 narrowed
                // `result.errors` to *fatal* React Compiler diagnostics (oxc-project/oxc#26128,
                // tracked as #26318) and `should_panic` answers false for `PanicThreshold::None`, so
                // on the default nothing is fatal and the list is always empty. The cost: a fatal
                // result aborts on the first function that fails to compile, so findings in a file
                // surface iteratively rather than all at once.
                panicThreshold: 'all_errors',
                flowSuppressions: false,
                // Without it the compiler skips every function under an
                // `eslint-disable-next-line react-hooks/exhaustive-deps` comment, and the repo has
                // 228. Lint-only: setting it in the build configs would change what those comments
                // make the build memoize, i.e. what ships.
                eslintSuppressionRules: [],
                environment: ENVIRONMENT,
            },
        });
    } catch (error) {
        // Malformed options are rejected at the binding rather than reported as a diagnostic;
        // swallowing it would make one bad edit to ENVIRONMENT look like a clean repo.
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
    const offsetToPoint = buildOffsetToPoint(sourceText);
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
                start: offsetToPoint(label?.start ?? 0),
                end: offsetToPoint(label?.end ?? label?.start ?? 0),
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

export {RULE_BY_CATEGORY, reactCompilerDiagnostics};
