/**
 * Selectors for the `rules_` collection.
 *
 * `GetRules` SETs every rule the user can see across every workspace, so the collection reference changes
 * on any rule write anywhere. A consumer that only needs a count or a flag reduces the collection to that
 * value here, which keeps `useOnyx` from deep-comparing a filtered copy of it on each of those writes.
 */
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {getExpenseDefaultRuleCount, hasExpenseDefaultRuleErrors} from '@libs/ExpenseDefaultRuleUtils';
import {filterRulesForPolicy, fromIndexMap, isApprovalWorkflowRule, isRuleFilterComparison, isRuleFilterNode} from '@libs/RuleUtils';
import {parseAmountFilterValue} from '@libs/SearchAmountFilterUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategory, Rule} from '@src/types/onyx';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

import type {OnyxCollection} from 'react-native-onyx';

type CategoryFlagLimit = {
    /** Amount in backend hundredths, including for zero-decimal currencies. */
    amount: number;
    currency: string;
    expenseLimitType: PolicyCategoryExpenseLimitType;
};

type CategoryFlagLimits = Partial<Record<string, CategoryFlagLimit & {ruleKey: string}>>;

const {ACTIONS, TRIGGERS, DAILY_BUDGET_FILTER} = CONST.RULES;
const {AND, EQUAL_TO, GREATER_THAN} = CONST.SEARCH.SYNTAX_OPERATORS;
const {CATEGORY, AMOUNT} = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const {DAILY, EXPENSE} = CONST.POLICY.EXPENSE_LIMIT_TYPES;

function getCategoryFlagLimitsForPolicy(rules: OnyxCollection<Rule>, policyID: string | undefined, policyCategory?: PolicyCategory): CategoryFlagLimits {
    const limits: Array<[string, CategoryFlagLimit & {ruleKey: string}]> = [];
    const migrationRuleKey = policyCategory?.maxExpenseAmountMigrationID ? `${ONYXKEYS.COLLECTION.RULE}${policyCategory.maxExpenseAmountMigrationID}` : undefined;
    for (const [ruleKey, rule] of Object.entries(filterRulesForPolicy(rules, policyID))) {
        if (!rule) {
            continue;
        }

        const actions = fromIndexMap<{name: string}>(rule.actions);
        const triggers = fromIndexMap<string>(rule.triggers);
        const {filters} = rule;
        // The legacy editor cannot round-trip additional triggers, actions, or conditions.
        if (
            actions.length !== 1 ||
            actions.at(0)?.name !== ACTIONS.TRIGGER_VIOLATION ||
            triggers.length !== 2 ||
            !triggers.includes(TRIGGERS.CREATE_TRANSACTION) ||
            !triggers.includes(TRIGGERS.UPDATE_TRANSACTION) ||
            !isRuleFilterNode(filters) ||
            isRuleFilterComparison(filters) ||
            filters.operator !== AND
        ) {
            continue;
        }

        const {left, right} = filters;
        if (!isRuleFilterComparison(left) || !isRuleFilterComparison(right)) {
            continue;
        }

        const [category, threshold] = left.left === CATEGORY ? [left, right] : [right, left];
        if (category.left !== CATEGORY || category.operator !== EQUAL_TO || typeof category.right !== 'string' || !category.right) {
            continue;
        }
        if (policyCategory && category.right !== policyCategory.name && ruleKey !== migrationRuleKey) {
            continue;
        }
        if ((threshold.left !== AMOUNT && threshold.left !== DAILY_BUDGET_FILTER) || threshold.operator !== GREATER_THAN || typeof threshold.right !== 'string') {
            continue;
        }

        const {amount, currency} = parseAmountFilterValue(threshold.right.trim());
        const amountInHundredths = convertToBackendAmount(Number(amount));
        if (!currency || !Number.isSafeInteger(amountInHundredths) || amountInHundredths < 0) {
            continue;
        }

        limits.push([category.right, {amount: amountInHundredths, currency, expenseLimitType: threshold.left === DAILY_BUDGET_FILTER ? DAILY : EXPENSE, ruleKey}]);
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
    getCategoryFlagLimitsForPolicy,
};
export type {CategoryFlagLimit, CategoryFlagLimits};
