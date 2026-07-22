/**
 * Helpers for listing Rules Revamp rules that apply to a specific workspace category,
 * used by the category details RHP contextual "Category rules" section.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
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
    route: Route;
    pendingAction?: PendingAction;
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
 * Each item navigates to the same edit route used from the centralized Rules page.
 */
function getCategoryContextualRules({
    policy,
    category,
    categoryName,
    translate,
    convertToDisplayString,
}: {
    policy: Policy | undefined;
    category: PolicyCategory | undefined;
    categoryName: string;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
}): CategoryContextualRule[] {
    if (!policy?.id || !category) {
        return [];
    }

    const policyID = policy.id;
    const policyCurrency = policy.outputCurrency ?? CONST.CURRENCY.USD;
    const rules: CategoryContextualRule[] = [];

    const flagSummary = getFlagForReviewContextualSummary(category, translate, convertToDisplayString, policyCurrency);
    if (flagSummary) {
        rules.push({
            key: `flag-for-review-${categoryName}`,
            summary: flagSummary,
            route: ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, categoryName),
            pendingAction: category.pendingFields?.maxExpenseAmount,
        });
    }

    if (categoryHasAnyRequireFieldsRule(category)) {
        const descriptions = getRequireFieldsRuleDescriptionsForCategory(category, translate, convertToDisplayString, policyCurrency);
        const summary = formatRequireFieldsRuleDescriptions(descriptions);
        if (summary) {
            rules.push({
                key: `require-fields-${categoryName}`,
                summary,
                route: ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, categoryName),
                pendingAction: getRequireFieldsPendingActionForCategory(category),
            });
        }
    }

    return rules;
}

export {getCategoryContextualRules};
export type {CategoryContextualRule};
