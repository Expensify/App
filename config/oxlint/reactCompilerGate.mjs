// Replicates the ESLint react-compiler-compat processor for oxlint's JS plugins.
//
// ESLint attaches a processor to every linted file (config/eslint/eslint.config.mjs) and
// config/eslint/processors/eslint-processor-react-compiler-compat.mjs runs BOTH React compilers
// in `preprocess`, then drops messages in `postprocess` when both memoized the file. oxlint has
// no processor concept, and no way to filter a native Rust rule's diagnostics, so the only place
// that decision can live is inside a JS plugin rule, wrapping `context.report`.
//
// Why both compilers: Metro and Jest use babel-plugin-react-compiler, the web build uses
// oxc-transform. When only one memoizes a file, that file ships without memoization on the other
// platform, so the manual memoization the rules enforce is still needed there.
//
// Two shapes, matching the two things the processor does:
//   withFullGating     drops EVERY report in a memoized file. For the rules the processor lists
//                      in RULES_SUPPRESSED_BY_REACT_COMPILER.
//   withMessageGating  drops only reports whose message matches a pattern. For exhaustive-deps,
//                      where the processor filters per message rather than per rule.
//
// The compiler runs lazily, on the first report in a file, and the answer is cached per filename.
// Calling it for every linted file instead would cost ~12 minutes repo-wide.
import path from 'node:path';

import {didBothCompilersMemoizeFile} from '../reactCompiler/checkBoth.mjs';

const memoizationCache = new Map();

/**
 * Mirrors the processor's preprocess step, including its two unconditional skips: files under
 * tests/ and node_modules/ are treated as NOT memoized, so their messages are never dropped.
 */
function isFileMemoizedByBothCompilers(filename, sourceText) {
    if (!memoizationCache.has(filename)) {
        const normalized = filename.split(path.sep).join('/');
        const skipped = normalized.includes('/tests/') || normalized.startsWith('tests/') || normalized.includes('node_modules/');
        memoizationCache.set(filename, skipped ? false : didBothCompilersMemoizeFile(sourceText, filename));
    }
    return memoizationCache.get(filename);
}

/** Resolves a report descriptor to its final message text (handles messageId + {{data}} templates). */
function resolveMessage(rule, descriptor) {
    if (typeof descriptor?.message === 'string') {
        return descriptor.message.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => descriptor.data?.[key] ?? match);
    }
    const template = rule.meta?.messages?.[descriptor?.messageId];
    if (typeof template !== 'string') {
        return '';
    }
    return template.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => descriptor.data?.[key] ?? match);
}

/**
 * Wraps a rule so `context.report` consults the compilers before reporting. `shouldGate` decides
 * per report whether being memoized is enough to drop it.
 */
function withGating(rule, shouldGate) {
    return {
        ...rule,
        create(context) {
            const gatedContext = Object.create(context, {
                report: {
                    // Forwarded as-is rather than as a single descriptor: ESLint also accepts the
                    // legacy `report(node, message)` form, and dropping the extra arguments would
                    // silently change a rule's message.
                    value(...args) {
                        if (shouldGate(rule, args[0])) {
                            const filename = context.filename ?? context.getFilename();
                            const sourceText = (context.sourceCode ?? context.getSourceCode()).text;
                            if (isFileMemoizedByBothCompilers(filename, sourceText)) {
                                return;
                            }
                        }
                        return context.report(...args);
                    },
                },
            });
            return rule.create(gatedContext);
        },
    };
}

/** For rules the processor drops wholesale in a memoized file. */
function withFullGating(rule) {
    return withGating(rule, () => true);
}

/** For rules the processor filters per message, i.e. exhaustive-deps. */
function withMessageGating(rule, pattern) {
    return withGating(rule, (target, descriptor) => pattern.test(resolveMessage(target, descriptor)));
}

export {withFullGating, withMessageGating};
