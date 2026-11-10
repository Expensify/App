/**
 * The App's hosted rules, listed once. plugins/hosted-rules.mjs builds the `hosted` plugin from it, ruleNames.mjs maps
 * the rule names back to ESLint IDs, and oxlint.config.mts lets overrides use the names. Keep this file free of heavy
 * imports: scripts/lint/oxlint/OxlintLinter.ts loads it through ruleNames.mjs.
 */

// ESLint plugin rules that no preset turns on but oxlint.config.mts does. oxlint has no native version of either.
const APP_HOSTED_ESLINT_RULE_IDS = ['jsdoc/require-jsdoc', 'react/no-unused-prop-types'];

// The App's own hosted rules (hosted/<name>) and the ESLint ID their `eslint-disable` comments use.
const APP_LOCAL_HOSTED_RULES = {
    // tsgolint misses `<MenuItem />`; see noDeprecatedSelfClosingJsx.mjs.
    'no-deprecated-self-closing-jsx': '@typescript-eslint/no-deprecated',
};

// Each of the above by the name it runs under (`hosted/<name>`), with the ESLint ID findings and comments use.
const APP_HOSTED_RULE_IDS_BY_NAME = {
    ...Object.fromEntries(APP_HOSTED_ESLINT_RULE_IDS.map((ruleID) => [ruleID.split('/').at(-1), ruleID])),
    ...APP_LOCAL_HOSTED_RULES,
};

export {APP_HOSTED_ESLINT_RULE_IDS, APP_HOSTED_RULE_IDS_BY_NAME, APP_LOCAL_HOSTED_RULES};
