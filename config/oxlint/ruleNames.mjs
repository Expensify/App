/**
 * oxlint and ESLint name some rules differently. This maps oxlint's names for findings back to ESLint's rule IDs, so
 * the lint output and the seatbelt baseline use the same IDs as ESLint. The package does the mapping; this adds the
 * App's own rules.
 */
import {toEslintRuleID} from 'eslint-config-expensify/oxlint/utils';

import {APP_HOSTED_ESLINT_RULE_IDS, APP_LOCAL_HOSTED_RULES} from './appHostedRules.mjs';

// The ESLint rule ID of each hosted rule the package does not list: rules only the App enables and the App's own (see
// appHostedRules.mjs).
const APP_HOSTED_RULE_ESLINT_IDS = {
    ...Object.fromEntries(APP_HOSTED_ESLINT_RULE_IDS.map((ruleID) => [ruleID.split('/').at(-1), ruleID])),
    ...APP_LOCAL_HOSTED_RULES,
};

/**
 * Converts oxlint's name for a finding, like `typescript(no-explicit-any)`, to ESLint's rule ID, like
 * `@typescript-eslint/no-explicit-any`. A code that does not look like `plugin(rule)` comes back unchanged.
 * @param {string} code
 * @returns {string}
 */
function oxlintCodeToESLintRuleID(code) {
    return toEslintRuleID(code, {hostedRules: APP_HOSTED_RULE_ESLINT_IDS, pluginPrefixes: {rc: 'react-hooks'}});
}

export {APP_HOSTED_RULE_ESLINT_IDS, oxlintCodeToESLintRuleID};
