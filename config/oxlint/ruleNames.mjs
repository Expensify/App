// Plain .mjs so the bun lint pipeline, oxlint's JS plugin runtime and the Python harness can all
// read one copy; only the first of those can load TypeScript.
const OXLINT_RULE_RENAMES = {
    'no-object-constructor': 'no-new-object',
    'no-new-native-nonconstructor': 'no-new-symbol',
};

// A rule hosted through oxlint's `jsPlugins` cannot take a native plugin's prefix (`react`,
// `import`, `react-hooks` and `@typescript-eslint` are reserved), so it is registered bare under
// `hosted` and this table is what gives it back its ESLint identity.
const HOSTED_RULE_ORIGIN = {
    'jsx-no-bind': 'react',
    'function-component-definition': 'react',
    'jsx-no-constructed-context-values': 'react',
    'exhaustive-deps': 'react-hooks',
    'prefer-default-export': 'import',
    order: 'import',
    'no-types': 'jsdoc',
    'naming-convention': '@typescript-eslint',
    'no-import-module-exports': 'import',
    'no-relative-packages': 'import',
    'no-useless-path-segments': 'import',
    'default-props-match-prop-types': 'react',
    'forbid-foreign-prop-types': 'react',
    'forbid-prop-types': 'react',
    'jsx-uses-react': 'react',
    'jsx-uses-vars': 'react',
    'no-access-state-in-setstate': 'react',
    'no-arrow-function-lifecycle': 'react',
    'no-deprecated': 'react',
    'no-invalid-html-attribute': 'react',
    'no-typos': 'react',
    'no-unused-class-component-methods': 'react',
    'no-unused-prop-types': 'react',
    'no-unused-state': 'react',
    'prefer-exact-props': 'react',
    'prefer-stateless-function': 'react',
    'sort-comp': 'react',
    'static-property-placement': 'react',
};

const REACT_HOOKS_RULES_UNDER_REACT = new Set(['exhaustive-deps', 'rules-of-hooks']);

const OXLINT_DIAGNOSTIC_CODE = /^([\w@/.-]+)\((.+)\)$/;

function hostedRuleNames(eslintPrefix) {
    return Object.keys(HOSTED_RULE_ORIGIN).filter((name) => HOSTED_RULE_ORIGIN[name] === eslintPrefix);
}

function oxlintCodeToESLintRuleID(code) {
    const match = OXLINT_DIAGNOSTIC_CODE.exec(code);
    if (!match) {
        return code;
    }
    const [, plugin, rule] = match;
    if (plugin === 'eslint' || plugin === 'core') {
        return OXLINT_RULE_RENAMES[rule] ?? rule;
    }
    if (plugin === 'typescript') {
        return `@typescript-eslint/${rule}`;
    }
    if (plugin === 'rc' || (plugin === 'react' && REACT_HOOKS_RULES_UNDER_REACT.has(rule))) {
        return `react-hooks/${rule}`;
    }
    if (plugin === 'hosted') {
        const origin = HOSTED_RULE_ORIGIN[rule];
        if (!origin) {
            throw new Error(`No HOSTED_RULE_ORIGIN entry for hosted rule "${rule}". Add it to config/oxlint/ruleNames.mjs.`);
        }
        return `${origin}/${rule}`;
    }
    if (plugin === 'jsx_a11y') {
        return `jsx-a11y/${rule}`;
    }
    return `${plugin}/${rule}`;
}

export {HOSTED_RULE_ORIGIN, OXLINT_RULE_RENAMES, hostedRuleNames, oxlintCodeToESLintRuleID};
