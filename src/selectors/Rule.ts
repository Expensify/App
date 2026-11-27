/**
 * Selectors for the `rules_` collection.
 *
 * `GetRules` SETs every rule the user can see across every workspace, so the collection reference changes
 * on any rule write anywhere. A consumer that only needs a count or a flag reduces the collection to that
 * value here, which keeps `useOnyx` from deep-comparing a filtered copy of it on each of those writes.
 */
import {getExpenseDefaultRuleCount, hasExpenseDefaultRuleErrors} from '@libs/ExpenseDefaultRuleUtils';
import {isApprovalWorkflowRule} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import type {Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

/** How many expense default rules the policy has, ignoring ones being deleted. */
const createExpenseDefaultRuleCountSelector = (policyID: string | undefined) => (rules: OnyxCollection<Rule>) => getExpenseDefaultRuleCount(rules, policyID);

/** Whether the policy has at least one expense default rule. */
const createHasExpenseDefaultRulesSelector = (policyID: string | undefined) => (rules: OnyxCollection<Rule>) => getExpenseDefaultRuleCount(rules, policyID) > 0;

/** Whether any of the policy's expense default rules failed to save. */
const createHasExpenseDefaultRuleErrorsSelector = (policyID: string | undefined) => (rules: OnyxCollection<Rule>) => hasExpenseDefaultRuleErrors(rules, policyID);

/**
 * The policy-scoped approval workflow rules, keyed like the collection. Approval routing only reads these, and they are a tiny
 * share of the collection on accounts with many expense rules, so code that routes many reports reads this instead of every rule.
 */
const approvalWorkflowRulesSelector = (rules: OnyxCollection<Rule>): OnyxCollection<Rule> => {
    const approvalWorkflowRules: NonNullable<OnyxCollection<Rule>> = {};
    for (const [onyxKey, rule] of Object.entries(rules ?? {})) {
        if (rule?.scope === CONST.RULES.SCOPE.POLICY && isApprovalWorkflowRule(rule)) {
            approvalWorkflowRules[onyxKey] = rule;
        }
    }
    return approvalWorkflowRules;
};

export {approvalWorkflowRulesSelector, createExpenseDefaultRuleCountSelector, createHasExpenseDefaultRuleErrorsSelector, createHasExpenseDefaultRulesSelector};
