/**
 * Runs oxc's Rust port of React Compiler on a file and turns what it finds into the same react-hooks/*
 * reports eslint-plugin-react-hooks gives. plugins/rc-rules.mjs reports them. We use the Rust port
 * because the JavaScript compiler in eslint-plugin-react-hooks would take up most of the oxlint run.
 */
import path from 'node:path';
import {transformSync} from 'oxc-transform-react';

import oxcReactCompilerConfig from '../babel/oxcReactCompilerConfig.js';

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

// A `Config` diagnostic means the compiler options are wrong; ignoring it would silence every rule.
const CONFIG_CATEGORY = 'Config';

// ESLint does not enable the rules behind these categories.
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

// The validations eslint-plugin-react-hooks turns on that oxc does not. The rest are already oxc
// defaults or land in IGNORED_CATEGORIES.
const ENVIRONMENT = {
    validateNoSetStateInEffects: true,
    // The plugin spells this `validateNoJSXInTryStatements`; oxc spells it with a lowercase `sx`.
    validateNoJsxInTryStatements: true,
    validateNoImpureFunctionsInRender: true,
    validateStaticComponents: true,
};

// The category is only in the formatted `codeframe` string, which is not a public API of
// oxc-transform-react. That is why package.json pins the exact version and an unmapped category throws.
const CATEGORY_PATTERN = /react-compiler\(([^)]+)\)/;

const cache = new Map();

/**
 * Picks the parser oxc-transform-react uses for the file. Plain JS files are parsed as JSX.
 * @param {string} ext file extension without the dot
 * @returns {'tsx' | 'ts' | 'jsx'} the `lang` oxc-transform-react parses the file as
 */
function getLang(ext) {
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'ts' || ext === 'mts' || ext === 'cts') {
        return 'ts';
    }
    return 'jsx';
}

/**
 * Byte width of a character in UTF-8, used by buildOffsetToPoint to turn the compiler's byte offsets into columns.
 * @param {number} code a code point
 * @returns {number} how many UTF-8 bytes it takes
 */
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

/**
 * `label.start`/`label.end` are UTF-8 byte offsets, while JavaScript strings index UTF-16 code units.
 * Using them directly drifts in any non-ASCII file, anchoring diagnostics on the wrong line where
 * `eslint-disable-next-line` no longer suppresses them. This maps a byte offset to the line and UTF-16
 * column oxlint's `loc` expects.
 * @param {string} source
 * @returns {(offset: number) => {line: number, column: number}}
 */
function buildOffsetToPoint(source) {
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

    /**
     * @param {number} offset UTF-8 byte offset into `source`
     * @returns {{line: number, column: number}} 1-based line and 0-based UTF-16 column
     */
    return function offsetToPoint(offset) {
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

/**
 * Formats the message the way eslint-plugin-react-hooks does, so both linters report the same text.
 * @param {string} category
 * @param {{message?: string, helpMessage?: string}} error
 * @returns {string}
 */
function buildMessage(category, error) {
    const heading = COMPILATION_SKIPPED_CATEGORIES.has(category) ? 'Compilation Skipped' : 'Error';
    const summary = `${heading}: ${error.message ?? 'Unknown compiler error'}`;
    return error.helpMessage ? `${summary}\n\n${error.helpMessage}.` : summary;
}

/**
 * Runs the compiler on one file and returns its findings as react-hooks rule reports. Throws on a
 * category it does not know, so an oxc-transform-react bump that changes the categories fails the run.
 * @param {string} filename
 * @param {string} sourceText
 * @returns {Array<{ruleName: string, loc: {start: {line: number, column: number}, end: {line: number, column: number}}, message: string}>}
 */
function analyze(filename, sourceText) {
    let result;
    try {
        const buildOptions = oxcReactCompilerConfig();
        result = transformSync(filename, sourceText, {
            lang: getLang(path.extname(filename).slice(1)),
            reactCompiler: {
                ...buildOptions,
                outputMode: 'lint',
                // Without it the binding returns only fatal diagnostics.
                reportDiagnostics: true,
                flowSuppressions: false,
                environment: {...buildOptions.environment, ...ENVIRONMENT},
            },
        });
    } catch (error) {
        // The binding throws on malformed options instead of reporting a diagnostic.
        const message = error instanceof Error ? error.message : String(error);
        if (/is none of these types|ReactCompilerOptions/.test(message)) {
            throw new Error(`oxc-transform-react rejected this module's React Compiler options: ${message}`);
        }
        return [];
    }

    const errors = result.errors ?? [];

    const rejected = errors.find((error) => (error.message ?? '').startsWith('Invalid React Compiler'));
    if (rejected) {
        throw new Error(`oxc-transform-react rejected this module's React Compiler options: ${rejected.message}`);
    }

    // A fatal result with no `react-compiler(...)` category is a parse failure, which oxlint's own
    // parser already reports.
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
        // eslint-plugin-react-hooks skips a diagnostic with no location; reporting it at 1:0 would be oxlint-only.
        if (!label) {
            continue;
        }
        diagnostics.push({
            ruleName,
            loc: {
                start: offsetToPoint(label.start),
                end: offsetToPoint(label.end ?? label.start),
            },
            message: buildMessage(category, error),
        });
    }
    return diagnostics;
}

/**
 * Each rc/* rule (one per react-hooks rule) needs the same compiler output, so the compile runs once
 * per file and the result is cached.
 * @param {string} filename
 * @param {string} sourceText
 * @returns {ReturnType<typeof analyze>}
 */
function reactCompilerDiagnostics(filename, sourceText) {
    if (!cache.has(filename)) {
        cache.set(filename, analyze(filename, sourceText));
    }
    return cache.get(filename);
}

export {RULE_BY_CATEGORY, reactCompilerDiagnostics};
