import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';
import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import type {Policy, PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {setPolicyCategoryMaxAmount} from './actions/Policy/Category';
import {getDecodedCategoryName} from './CategoryUtils';
import {convertToFrontendAmountAsString} from './CurrencyUtils';

type FlagForReviewTableItem = TableData & {
    ruleID: string;
    categoryName: string;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    action: () => void;
};

function hasExplicitFlagAmount(maxExpenseAmount: number | null | undefined): maxExpenseAmount is number {
    return maxExpenseAmount !== null && maxExpenseAmount !== undefined && maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function isCategoryFieldPending(pendingAction: PendingAction | undefined): boolean {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
}

function getFlagForReviewRuleNavigationRoute(policyID: string, categoryName: string): Route {
    return ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, categoryName);
}

function getFlagForReviewFormFromCategory(
    category: PolicyCategory | undefined,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    policyCurrency: string,
): FlagForReviewRuleForm {
    const maxExpenseAmount = category?.maxExpenseAmount;

    return {
        category: category?.name,
        maxExpenseAmount: hasExplicitFlagAmount(maxExpenseAmount) ? convertToFrontendAmountAsString(maxExpenseAmount, getCurrencyDecimals(policyCurrency)) : '',
        expenseLimitType: category?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
    };
}

function saveFlagForReviewRule(policyID: string, policyCategories: PolicyCategories | undefined, form: FlagForReviewRuleForm) {
    const categoryName = form.category;
    if (!categoryName) {
        return;
    }

    setPolicyCategoryMaxAmount(policyID, categoryName, form.maxExpenseAmount ?? '', form.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE, policyCategories);
}

function deleteFlagForReviewRule(policyID: string, categoryName: string, policyCategories: PolicyCategories | undefined) {
    const category = policyCategories?.[categoryName];
    const expenseLimitType = category?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;

    setPolicyCategoryMaxAmount(policyID, categoryName, '', expenseLimitType, policyCategories);
}

function getFlagForReviewTableData({
    policy,
    policyCategories,
    translate,
    convertToDisplayString,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    onNavigate: (route: Route) => void;
}): FlagForReviewTableItem[] {
    if (!policy?.id || !policyCategories) {
        return [];
    }

    const policyID = policy.id;
    const policyCurrency = policy.outputCurrency ?? CONST.CURRENCY.USD;
    const typeLabel = translate('workspace.rules.flagForReviewTable.typeLabel');
    const ruleDescription = translate('workspace.rules.flagForReviewTable.flagForReview');
    const rules: FlagForReviewTableItem[] = [];

    for (const [categoryName, category] of Object.entries(policyCategories)) {
        if (!category?.enabled || !hasExplicitFlagAmount(category.maxExpenseAmount)) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const amountDisplay = convertToDisplayString(category.maxExpenseAmount, policyCurrency);
        const conditionText = translate('workspace.rules.flagForReviewTable.conditionCategoryAndAmount', decodedCategoryName, amountDisplay);
        const pendingFields = category.pendingFields;

        rules.push({
            keyForList: categoryName,
            ruleID: categoryName,
            categoryName,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [decodedCategoryName, conditionText, ruleDescription, typeLabel],
            pendingAction: pendingFields?.maxExpenseAmount,
            disabled: isCategoryFieldPending(pendingFields?.maxExpenseAmount),
            action: () => onNavigate(getFlagForReviewRuleNavigationRoute(policyID, categoryName)),
        });
    }

    return rules;
}

export {deleteFlagForReviewRule, getFlagForReviewFormFromCategory, getFlagForReviewRuleNavigationRoute, getFlagForReviewTableData, hasExplicitFlagAmount, saveFlagForReviewRule};
export type {FlagForReviewTableItem};
