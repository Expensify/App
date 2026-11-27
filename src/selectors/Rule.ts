/**
 * Selectors for the `rules_` collection.
 *
 * `GetRules` SETs every rule the user can see across every workspace, so the collection reference changes
 * on any rule write anywhere. A consumer that only needs a count or a flag reduces the collection to that
 * value here, which keeps `useOnyx` from deep-comparing a filtered copy of it on each of those writes.
 */
import {getExpenseDefaultRuleCount, hasExpenseDefaultRuleErrors} from '@libs/ExpenseDefaultRuleUtils';
import type {CategoryFlagLimits, FlagForReviewConditions} from '@libs/FlagForReviewRulesUtils';
import {getFlagForReviewConditions} from '@libs/FlagForReviewRulesUtils';
import {filterRulesForPolicy, isApprovalWorkflowRule} from '@libs/RuleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategory, Rule} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection} from 'react-native-onyx';

type FlagForReviewRules = Record<string, FlagForReviewConditions & {pendingAction?: PendingAction; hasErrors: boolean}>;

function getFlagForReviewRulesForPolicy(rules: OnyxCollection<Rule>, policyID: string): FlagForReviewRules {
    const flags: FlagForReviewRules = {};
    for (const [ruleKey, rule] of Object.entries(filterRulesForPolicy(rules, policyID))) {
        const conditions = getFlagForReviewConditions(rule ?? undefined);
        if (conditions) {
            flags[ruleKey.slice(ONYXKEYS.COLLECTION.RULE.length)] = {...conditions, pendingAction: rule?.pendingAction, hasErrors: !!rule?.errors};
        }
    }
    return flags;
}

const createFlagForReviewRulesSelector = (policyID: string) => (rules: OnyxCollection<Rule>) => getFlagForReviewRulesForPolicy(rules, policyID);

function getCategoryFlagLimitsForPolicy(rules: OnyxCollection<Rule>, policyID: string, policyCategory?: PolicyCategory): CategoryFlagLimits {
    const limits: Array<[string, NonNullable<CategoryFlagLimits[string]>]> = [];
    for (const [ruleID, {categoryName, merchant, limit, pendingAction}] of Object.entries(getFlagForReviewRulesForPolicy(rules, policyID))) {
        if (!categoryName || merchant || !limit) {
            continue;
        }
        if (policyCategory && categoryName !== policyCategory.name && ruleID !== String(policyCategory.maxExpenseAmountMigrationID)) {
            continue;
        }
        limits.push([categoryName, {...limit, ruleID, pendingAction}]);
    }
    return Object.fromEntries(limits);
}

const createCategoryFlagLimitsSelector = (policyID: string, category?: PolicyCategory) => (rules: OnyxCollection<Rule>) => getCategoryFlagLimitsForPolicy(rules, policyID, category);

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

export {
    approvalWorkflowRulesSelector,
    createCategoryFlagLimitsSelector,
    createExpenseDefaultRuleCountSelector,
    createHasExpenseDefaultRuleErrorsSelector,
    createHasExpenseDefaultRulesSelector,
    createFlagForReviewRulesSelector,
    getCategoryFlagLimitsForPolicy,
    getFlagForReviewRulesForPolicy,
};
export type {FlagForReviewRules};
