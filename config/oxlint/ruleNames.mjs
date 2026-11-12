/**
 * Maps oxlint's finding names to ESLint rule IDs through the package's toEslintRuleID, adding the App's hosted rule IDs
 * and the `rc` prefix.
 */
import {toEslintRuleID} from 'eslint-config-expensify/oxlint/utils';

import {APP_HOSTED_RULE_IDS_BY_NAME} from './appHostedRules.mjs';

/**
 * Converts oxlint's name for a finding, like `typescript(no-explicit-any)`, to ESLint's rule ID, like
 * `@typescript-eslint/no-explicit-any`. A code that does not look like `plugin(rule)` comes back unchanged.
 * @param {string} code
 * @returns {string}
 */
function oxlintCodeToESLintRuleID(code) {
    return toEslintRuleID(code, {hostedRules: APP_HOSTED_RULE_IDS_BY_NAME, pluginPrefixes: {rc: 'react-hooks'}});
}

export default oxlintCodeToESLintRuleID;
