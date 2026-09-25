import {withEslintDirectiveIds} from '../eslintDirectives.mjs';
import {RULE_BY_CATEGORY, reactCompilerDiagnostics} from '../reactCompilerRust.mjs';

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
