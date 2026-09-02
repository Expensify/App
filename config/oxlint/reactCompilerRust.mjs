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
                panicThreshold: 'none',
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
    } catch {
        return [];
    }

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

function reactCompilerDiagnostics(filename, sourceText) {
    if (!cache.has(filename)) {
        cache.set(filename, analyze(filename, sourceText));
    }
    return cache.get(filename);
}

export {IGNORED_CATEGORIES, RULE_BY_CATEGORY, reactCompilerDiagnostics};
