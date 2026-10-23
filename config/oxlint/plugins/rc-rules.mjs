/**
 * The React Compiler rules from eslint-plugin-react-hooks (react-hooks/refs, react-hooks/purity, ...),
 * rebuilt for oxlint under the `rc` name. They all share one compile per file, done in reactCompilerRust.mjs.
 */
import {withEslintDirectiveIDs} from '../eslintDirectives.mjs';
import {RULE_BY_CATEGORY, reactCompilerDiagnostics} from '../reactCompilerRust.mjs';

/**
 * Builds the oxlint stand-in for one React Compiler rule of eslint-plugin-react-hooks, like
 * `react-hooks/refs`. It reports only that rule's findings. The compile is shared (see reactCompilerDiagnostics).
 * @param {string} ruleName a react-hooks rule name, like `refs`
 * @returns {import('eslint').Rule.RuleModule}
 */
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

const rules = Object.fromEntries(Object.values(RULE_BY_CATEGORY).map((ruleName) => [ruleName, withEslintDirectiveIDs(buildRule(ruleName), `react-hooks/${ruleName}`)]));

const plugin = {
    meta: {
        name: 'rc',
        version: '0.0.1',
    },
    rules,
};

export default plugin;
