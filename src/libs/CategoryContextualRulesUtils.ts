/**
 * Helpers for listing Rules Revamp rules that apply to a specific workspace category,
 * used by the category details RHP contextual "Category rules" section.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, PolicyCategory, Rule} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {OnyxCollection} from 'react-native-onyx';

import {getRuleDeletionPendingAction} from './CategoryTaxRulesUtils';
import {getCategoryExpenseDefaultRules, getExpenseDefaultRuleSummaryFields, getExpenseDefaultTaxID, isEditableExpenseDefaultRule} from './ExpenseDefaultRuleUtils';
import {hasExplicitFlagAmount} from './FlagForReviewRulesUtils';
import {getExpenseDefaultConditionText, getExpenseDefaultRuleDescription} from './MerchantTypeRulesUtils';
import {
    categoryHasAnyRequireFieldsRule,
    formatRequireFieldsRuleDescriptions,
    getRequireFieldsPendingActionForCategory,
    getRequireFieldsRuleDescriptionsForCategory,
} from './RequireFieldsRulesUtils';

type CategoryContextualRule = {
    key: string;
    summary: string;
    /** What the rule matches on, shown under the summary so two rules with the same action can be told apart. */
    conditionSummary?: string;
    /** Dynamic route suffix under category settings (keeps Categories underlay on refresh). */
    dynamicRoutePath: DynamicRouteSuffix | ReturnType<typeof DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_EDIT.getRoute>;
    /** Sentry label for the rule row, one variant per rule type */
    sentryLabel: SentryLabel;
    pendingAction?: PendingAction;
    /** Optimistically deleted rules stay listed (struck through) but must not be openable. */
    isDisabled?: boolean;
};

function getFlagForReviewContextualSummary(
    category: PolicyCategory,
    translate: LocaleContextProps['translate'],
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
    policyCurrency: string,
): string | undefined {
    if (!hasExplicitFlagAmount(category.maxExpenseAmount)) {
        return undefined;
    }

    const amountDisplay = convertToDisplayString(category.maxExpenseAmount, policyCurrency);
    const expenseLimitType = category.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;

    if (expenseLimitType === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY) {
        return translate('workspace.rules.categoryRules.contextualFlagForReviewDaily', amountDisplay);
    }

    return translate('workspace.rules.categoryRules.contextualFlagForReview', amountDisplay);
}

/**
 * Returns Rules Revamp rules scoped to a category for display in the category details RHP.
 * Each item navigates via a category dynamic edit route so refresh keeps Categories as the central pane.
 */
function getCategoryContextualRules({
    policy,
    policyRules,
    category,
    categoryName,
    translate,
    convertToDisplayString,
    isOffline,
}: {
    policy: Policy | undefined;
    /** Read for the pending delete of the category a tax default depends on. */
    /** Holds the rule that acts as this category's tax default. */
    policyRules?: OnyxCollection<Rule>;
    category: PolicyCategory | undefined;
    categoryName: string;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    /** Offline keeps optimistically deleted rules listed so the pending delete is visible. */
    isOffline: boolean;
}): CategoryContextualRule[] {
    if (!policy?.id || !category) {
        return [];
    }

    const policyCurrency = policy.outputCurrency ?? CONST.CURRENCY.USD;
    const rules: CategoryContextualRule[] = [];

    const flagPendingAction = category.pendingFields?.maxExpenseAmount;
    const isFlagPendingDelete = flagPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const flagSummary = getFlagForReviewContextualSummary(category, translate, convertToDisplayString, policyCurrency);
    if (flagSummary && (isOffline || !isFlagPendingDelete)) {
        rules.push({
            key: `flag-for-review-${categoryName}`,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.SETTINGS_RULE_ROW.FLAG_FOR_REVIEW,
            summary: flagSummary,
            dynamicRoutePath: DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_EDIT.path,
            pendingAction: flagPendingAction,
            isDisabled: isFlagPendingDelete,
        });
    }

    // Mirrors getRequireFieldsTableData: a pending delete keeps the rule listed, and its description has to
    // include the fields being removed, otherwise the summary comes back empty and the row disappears.
    const requireFieldsPendingAction = getRequireFieldsPendingActionForCategory(category);
    const isRequireFieldsPendingDelete = requireFieldsPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const hasRequireFieldsRule = categoryHasAnyRequireFieldsRule(category) || isRequireFieldsPendingDelete;

    if (hasRequireFieldsRule && (isOffline || !isRequireFieldsPendingDelete)) {
        const descriptions = getRequireFieldsRuleDescriptionsForCategory(category, translate, convertToDisplayString, policyCurrency, isRequireFieldsPendingDelete);
        const summary = formatRequireFieldsRuleDescriptions(descriptions);
        if (summary) {
            rules.push({
                key: `require-fields-${categoryName}`,
                sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.SETTINGS_RULE_ROW.REQUIRE_FIELDS,
                summary,
                dynamicRoutePath: DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_REQUIRE_FIELDS_EDIT.path,
                pendingAction: requireFieldsPendingAction,
                isDisabled: isRequireFieldsPendingDelete,
            });
        }
    }

    // An expense default is an ordinary rule rather than something stored on the category, so it is looked up by
    // what it matches on. The summary is the table's, so a rule reads the same in both places.
    for (const {ruleID, rule} of getCategoryExpenseDefaultRules(policyRules, policy.id, categoryName)) {
        const summary = getExpenseDefaultRuleDescription(getExpenseDefaultRuleSummaryFields(rule), policy, translate, convertToDisplayString);
        if (!summary) {
            continue;
        }

        // Deleting the category a rule matches on leaves the rule in place on the server, so only the rate it
        // applies lends its pending delete here.
        const rulePendingAction = rule.pendingAction ?? getRuleDeletionPendingAction(policy, getExpenseDefaultTaxID(rule));
        const isRulePendingDelete = rulePendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        // The editor refuses a rule it cannot represent, such as one built from an `or` tree, so opening this row
        // would land on Not Found. It stays listed, because the rule does apply to the category.
        const isRuleOpenable = isEditableExpenseDefaultRule(rule);
        if (!isOffline && isRulePendingDelete) {
            continue;
        }

        rules.push({
            key: `expense-default-${ruleID}`,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.CATEGORIES.SETTINGS_RULE_ROW.TAX,
            summary,
            // The category is left out, since naming the page the admin is already on reads as noise.
            conditionSummary: getExpenseDefaultConditionText(rule.filters, translate, true),
            dynamicRoutePath: DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_EDIT.getRoute(ruleID),
            pendingAction: rulePendingAction,
            isDisabled: isRulePendingDelete || !isRuleOpenable,
        });
    }

    return rules;
}

export default getCategoryContextualRules;
