/**
 * oxlint and ESLint name some rules differently. This maps between the two, so oxlint findings show up
 * under ESLint's rule IDs and hosted-rules.mjs knows which ESLint plugin each hosted rule comes from.
 * It's plain `.mjs` because oxlint's JS plugins can't load TypeScript.
 */
const OXLINT_RULE_RENAMES = {
    'no-object-constructor': 'no-new-object',
    'no-new-native-nonconstructor': 'no-new-symbol',
};

// oxlint reserves native plugin prefixes (`react`, `import`, `react-hooks`, `@typescript-eslint`), so
// hosted rules register under `hosted` and this maps each back to its ESLint plugin.
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
    'require-jsdoc': 'jsdoc',
    'await-interactions': 'storybook',
    'context-in-play-function': 'storybook',
    'default-exports': 'storybook',
    'hierarchy-separator': 'storybook',
    'no-redundant-story-name': 'storybook',
    'no-renderer-packages': 'storybook',
    'no-uninstalled-addons': 'storybook',
    'prefer-pascal-case': 'storybook',
    'story-exports': 'storybook',
    'use-storybook-expect': 'storybook',
    'use-storybook-testing-library': 'storybook',
};

const HOSTED_RULE_ESLINT_ID = {
    'no-deprecated-self-closing-jsx': '@typescript-eslint/no-deprecated',
};

const OXLINT_DIAGNOSTIC_CODE = /^([\w@/.-]+)\((.+)\)$/;

/**
 * Lists the hosted rules copied from one ESLint plugin, so hosted-rules.mjs knows which rules to load
 * from that package.
 * @param {string} eslintPrefix an ESLint plugin name, like `react`
 * @returns {string[]}
 */
function hostedRuleNames(eslintPrefix) {
    return Object.keys(HOSTED_RULE_ORIGIN).filter((name) => HOSTED_RULE_ORIGIN[name] === eslintPrefix);
}

/**
 * Converts oxlint's name for a finding, like `typescript(no-explicit-any)`, to ESLint's rule ID, like
 * `@typescript-eslint/no-explicit-any`, so the lint output and the oxlint seatbelt baseline use the
 * same rule names as ESLint. A code that does not look like `plugin(rule)` comes back unchanged.
 * @param {string} code
 * @returns {string}
 */
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
    if (plugin === 'rc') {
        return `react-hooks/${rule}`;
    }
    if (plugin === 'hosted') {
        if (HOSTED_RULE_ESLINT_ID[rule]) {
            return HOSTED_RULE_ESLINT_ID[rule];
        }
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

export {HOSTED_RULE_ESLINT_ID, HOSTED_RULE_ORIGIN, OXLINT_RULE_RENAMES, hostedRuleNames, oxlintCodeToESLintRuleID};
