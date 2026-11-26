/** Maps oxlint's finding names to ESLint rule IDs: the package's toEslintRuleID plus the App's hosted rules and `rc`. */
import {toEslintRuleID} from 'eslint-config-expensify/oxlint/utils';

import {APP_HOSTED_RULE_IDS_BY_NAME} from './appHostedRules.mjs';

/**
 * Converts a finding like `typescript(no-explicit-any)` to its ESLint rule ID.
 * @param {string} code
 * @returns {string}
 */
function oxlintCodeToESLintRuleID(code) {
    return toEslintRuleID(code, {hostedRules: APP_HOSTED_RULE_IDS_BY_NAME, pluginPrefixes: {rc: 'react-hooks'}});
}

export default oxlintCodeToESLintRuleID;
