/**
 * The App's hosted rules. plugins/hosted-rules.mjs builds the `hosted` plugin from it and ruleNames.mjs maps the names back to
 * ESLint IDs. Several entry points load this file, so keep it free of imports.
 */

// ESLint plugin rules that no preset turns on but oxlint.config.mts does.
const APP_HOSTED_ESLINT_RULE_IDS = ['jsdoc/require-jsdoc', 'react/no-unused-prop-types'];

// The App's own hosted rules (hosted/<name>) and the ESLint ID their `eslint-disable` comments use.
const APP_LOCAL_HOSTED_RULES = {
    'no-deprecated-self-closing-jsx': '@typescript-eslint/no-deprecated',
};

// Each rule by its `hosted/<name>`, with its ESLint ID.
const APP_HOSTED_RULE_IDS_BY_NAME = {
    ...Object.fromEntries(APP_HOSTED_ESLINT_RULE_IDS.map((ruleID) => [ruleID.split('/').at(-1), ruleID])),
    ...APP_LOCAL_HOSTED_RULES,
};

export {APP_HOSTED_ESLINT_RULE_IDS, APP_HOSTED_RULE_IDS_BY_NAME, APP_LOCAL_HOSTED_RULES};
