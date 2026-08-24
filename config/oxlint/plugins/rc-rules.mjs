// The 12 React Compiler rules, reading the Rust compiler instead of the JavaScript one.
//
// Same rule ids ESLint uses, same categories, same lines -- only the engine underneath changes. See
// config/oxlint/reactCompilerRust.mjs for why, and for the measurements.
//
// Prefix `rc`, because `react` is reserved for oxlint's native plugin. The native `react/*` rules are
// not usable for these 12: they skip any function reached by a `react-hooks/exhaustive-deps` or
// `react-hooks/rules-of-hooks` disable comment, in either the eslint- or oxlint- spelling, which on
// this repo silences up to 184 real findings. See config/oxlint/reactCompilerRust.mjs.
//
// Every rule is wrapped with `withEslintDirectiveIds(rule, 'react-hooks/<name>')`, so an existing
// `// eslint-disable-next-line react-hooks/refs` keeps suppressing it now that the rule answers to
// `rc/refs`. That wrapper and `eslintSuppressionRules: []` are independent and both needed: the
// option stops the COMPILER treating a comment as an opt-out from analysis, the wrapper is what
// still honors a comment naming THIS rule.
//
// Reporting happens once per file, from `Program`. The diagnostics are already computed for the
// whole file, with their own locations; walking nodes to re-find them would only add a second way to
// anchor them wrongly.
import {withEslintDirectiveIds} from '../eslintDirectives.mjs';
import {RULE_BY_CATEGORY, reactCompilerDiagnostics} from '../reactCompilerRust.mjs';

/** https://react.dev/reference/eslint-plugin-react-hooks/lints/<name>, the same docs ESLint links. */
function buildRule(ruleName) {
    return {
        meta: {
            type: 'problem',
            docs: {
                description: `React Compiler: ${ruleName}`,
                url: `https://react.dev/reference/eslint-plugin-react-hooks/lints/${ruleName}`,
            },
            schema: [],
        },
        create(context) {
            return {
                Program() {
                    const filename = context.filename ?? context.getFilename();
                    const sourceCode = context.sourceCode ?? context.getSourceCode();
                    for (const diagnostic of reactCompilerDiagnostics(filename, sourceCode.text)) {
                        if (diagnostic.ruleName !== ruleName) {
                            continue;
                        }
                        context.report({loc: diagnostic.loc, message: diagnostic.message});
                    }
                },
            };
        },
    };
}

const rules = Object.fromEntries(Object.values(RULE_BY_CATEGORY).map((ruleName) => [ruleName, withEslintDirectiveIds(buildRule(ruleName), `react-hooks/${ruleName}`)]));

const plugin = {
    meta: {
        name: 'rc',
        version: '0.0.1',
    },
    rules,
};

export default plugin;
