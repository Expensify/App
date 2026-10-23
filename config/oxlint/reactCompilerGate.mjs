/**
 * In files React Compiler already memoizes, lint shouldn't tell people to add useCallback or useMemo.
 * For ESLint, scripts/lint's ReactCompilerFilter drops those reports. oxlint has no processors and
 * can't filter its native rules, so here the JS plugin rule itself is wrapped and drops them.
 */
import path from 'node:path';

import {didBothCompilersMemoizeFile} from '../reactCompiler/checkBoth.mjs';

const memoizationCache = new Map();

function isFileMemoizedByBothCompilers(filename, sourceText) {
    if (!memoizationCache.has(filename)) {
        const normalized = filename.split(path.sep).join('/');
        const skipped = normalized.includes('/tests/') || normalized.startsWith('tests/') || normalized.includes('node_modules/');
        memoizationCache.set(filename, skipped ? false : didBothCompilersMemoizeFile(sourceText, filename));
    }
    return memoizationCache.get(filename);
}

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

// Drops these rules' reports in files both React Compilers memoize, where the fix they suggest
// (useCallback/useMemo) is banned. Under scripts/lint this also leaves ReactCompilerFilter nothing to
// compile: the compile runs here, inside the parallel JS-plugin shards, instead of after them.
function withGating(rule, shouldGate) {
    return {
        ...rule,
        create(context) {
            const gatedContext = Object.create(context, {
                report: {
                    // Keeps every argument: ESLint also accepts the legacy `report(node, message)` form.
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

function withFullGating(rule) {
    return withGating(rule, () => true);
}

function withMessageGating(rule, pattern) {
    return withGating(rule, (target, descriptor) => pattern.test(resolveMessage(target, descriptor)));
}

export {withFullGating, withMessageGating};
