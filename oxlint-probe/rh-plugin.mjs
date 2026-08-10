// Re-exposes eslint-plugin-react-hooks v7 rules to oxlint via jsPlugins.
// The plugin instance is the same one ESLint uses (nested under eslint-config-expensify).
//
// 'react-hooks' is a reserved plugin name in oxlint (native Rust impl), so the rules are
// aliased as 'rh/<name>'. Suppression comments therefore need the 'rh/' id — the repo
// convention is a same-line combo, e.g.:
//     /* oxlint-disable-next-line rh/refs */ // eslint-disable-next-line react-hooks/refs
//
// 'exhaustive-deps' is wrapped to replicate the ESLint react-compiler-compat processor's
// per-message gating (config/eslint/processors/eslint-processor-react-compiler-compat.mjs):
// in files that BOTH React compilers memoize, "wrap in useCallback()/useMemo()" suggestions
// are dropped; missing-dependency warnings always survive. The compiler check is only run
// lazily — the first time a gated-pattern message fires in a file — and cached, so the cost
// is a few seconds repo-wide instead of minutes.
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {didBothCompilersMemoizeFile} from '../config/reactCompiler/checkBoth.mjs';

const require = createRequire(import.meta.url);
const pluginDir = path.dirname(fileURLToPath(import.meta.url));

// Same copy ESLint resolves (eslint-config-expensify's dependency, v7.1.1)
const reactHooks = require(path.resolve(pluginDir, '../node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks'));

// Keep in sync with EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN in the ESLint processor.
const GATED_MESSAGE_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;

const memoizationCache = new Map();

function isFileMemoizedByBothCompilers(filename, sourceText) {
    if (!memoizationCache.has(filename)) {
        memoizationCache.set(filename, didBothCompilersMemoizeFile(sourceText, filename));
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

function withCompilerGating(rule) {
    return {
        ...rule,
        create(context) {
            const gatedContext = Object.create(context, {
                report: {
                    value(descriptor) {
                        if (GATED_MESSAGE_PATTERN.test(resolveMessage(rule, descriptor))) {
                            const filename = context.filename ?? context.getFilename();
                            const sourceText = (context.sourceCode ?? context.getSourceCode()).text;
                            if (isFileMemoizedByBothCompilers(filename, sourceText)) {
                                return;
                            }
                        }
                        return context.report(descriptor);
                    },
                },
            });
            return rule.create(gatedContext);
        },
    };
}

const plugin = {
    meta: {
        name: 'rh',
        version: reactHooks.meta?.version ?? '0.0.0',
    },
    rules: {
        ...reactHooks.rules,
        'exhaustive-deps': withCompilerGating(reactHooks.rules['exhaustive-deps']),
    },
};

export default plugin;
