/**
 * In files React Compiler already memoizes, lint shouldn't tell people to add useCallback or useMemo.
 * scripts/lint's ReactCompilerFilter drops those reports after the run, but a plain oxlint run skips it, and
 * dropping them here moves the compile into the parallel JS-plugin shards, so the rule itself is wrapped.
 */
import {isFileMemoized} from '../reactCompiler/checkWithOxc.mjs';

const memoizationCache = new Map();

/**
 * The lint pipeline's memoization verdict, remembered per file because compiling is slow.
 * @param {string} filename
 * @param {string} sourceText
 * @returns {boolean}
 */
function isFileMemoizedOnce(filename, sourceText) {
    if (!memoizationCache.has(filename)) {
        memoizationCache.set(filename, isFileMemoized(sourceText, filename));
    }
    return memoizationCache.get(filename);
}

/**
 * Gets the final text of a report, so withMessageGating can match it. Rules pass either a `message` or
 * a `messageId` into `meta.messages`, both with `{{placeholders}}`.
 * @param {import('eslint').Rule.RuleModule} rule
 * @param {import('eslint').Rule.ReportDescriptor | undefined} descriptor
 * @returns {string}
 */
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
 * Drops the rule's reports in files React Compiler memoizes, where the fix they suggest
 * (useCallback/useMemo) is banned. Doing it here also runs the compile inside the parallel JS-plugin
 * shards, so under scripts/lint ReactCompilerFilter only sees these reports in files that are not memoized.
 * @param {import('eslint').Rule.RuleModule} rule
 * @param {(rule: import('eslint').Rule.RuleModule, descriptor: import('eslint').Rule.ReportDescriptor) => boolean} shouldGate picks the reports to drop
 * @returns {import('eslint').Rule.RuleModule}
 */
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
                            if (isFileMemoizedOnce(filename, sourceText)) {
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

/**
 * For rules whose every report asks for manual memoization, like jsx-no-constructed-context-values.
 * @param {import('eslint').Rule.RuleModule} rule
 * @returns {import('eslint').Rule.RuleModule}
 */
function withFullGating(rule) {
    return withGating(rule, () => true);
}

/**
 * For rules where only some reports ask for manual memoization. exhaustive-deps also reports missing
 * dependencies, which still apply, so only reports whose message matches `pattern` are hidden.
 * @param {import('eslint').Rule.RuleModule} rule
 * @param {RegExp} pattern
 * @returns {import('eslint').Rule.RuleModule}
 */
function withMessageGating(rule, pattern) {
    return withGating(rule, (target, descriptor) => pattern.test(resolveMessage(target, descriptor)));
}

export {withFullGating, withMessageGating};
