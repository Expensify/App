/**
 * Helpers for listing Rules Revamp rules that apply to a specific workspace category,
 * used by the category details RHP contextual "Category rules" section.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, PolicyCategory} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import {hasExplicitFlagAmount} from './FlagForReviewRulesUtils';
import {
    categoryHasAnyRequireFieldsRule,
    formatRequireFieldsRuleDescriptions,
    getRequireFieldsPendingActionForCategory,
    getRequireFieldsRuleDescriptionsForCategory,
} from './RequireFieldsRulesUtils';

type CategoryContextualRule = {
    key: string;
    summary: string;
    /** Dynamic route suffix under category settings (keeps Categories underlay on refresh). */
    dynamicRoutePath: DynamicRouteSuffix;
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
    category,
    categoryName,
    translate,
    convertToDisplayString,
    isOffline,
}: {
    policy: Policy | undefined;
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
                summary,
                dynamicRoutePath: DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_REQUIRE_FIELDS_EDIT.path,
                pendingAction: requireFieldsPendingAction,
                isDisabled: isRequireFieldsPendingDelete,
            });
        }
    }

    return rules;
}

export default getCategoryContextualRules;
