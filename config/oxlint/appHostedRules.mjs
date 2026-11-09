/**
 * The App's hosted rules, listed once. plugins/hosted-rules.mjs builds the `hosted` plugin from it, ruleNames.mjs maps
 * the rule names back to ESLint IDs, and oxlint.config.mts lets overrides use the names. Keep this file free of heavy
 * imports: scripts/lint/oxlint/OxlintLinter.ts loads it through ruleNames.mjs.
 */

// ESLint plugin rules that no preset turns on but oxlint.config.mts does. oxlint has no native version of any of them.
// `storybook/` rules come from eslint-plugin-storybook, which the package does not list, so hosted-rules.mjs passes
// its rules to hostRule.
const APP_HOSTED_ESLINT_RULE_IDS = [
    'jsdoc/require-jsdoc',
    'react/no-unused-prop-types',
    'storybook/await-interactions',
    'storybook/context-in-play-function',
    'storybook/default-exports',
    'storybook/hierarchy-separator',
    'storybook/no-redundant-story-name',
    'storybook/no-renderer-packages',
    'storybook/no-uninstalled-addons',
    'storybook/prefer-pascal-case',
    'storybook/story-exports',
    'storybook/use-storybook-expect',
    'storybook/use-storybook-testing-library',
];

// The App's own hosted rules (hosted/<name>) and the ESLint ID their `eslint-disable` comments use.
const APP_LOCAL_HOSTED_RULES = {
    // tsgolint misses `<MenuItem />`; see noDeprecatedSelfClosingJsx.mjs.
    'no-deprecated-self-closing-jsx': '@typescript-eslint/no-deprecated',
};

export {APP_HOSTED_ESLINT_RULE_IDS, APP_LOCAL_HOSTED_RULES};
