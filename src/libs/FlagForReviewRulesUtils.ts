import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';
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

function getFlagForReviewRuleAmountError(maxExpenseAmount: string | undefined, translate: LocaleContextProps['translate']): string | undefined {
    const trimmedAmount = maxExpenseAmount?.trim() ?? '';

    if (!trimmedAmount) {
        return translate('workspace.rules.flagForReviewRule.confirmErrorAmount');
    }

    const parsedAmount = Number.parseFloat(trimmedAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return translate('workspace.rules.flagForReviewRule.confirmErrorAmount');
    }

    return undefined;
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
        [INPUT_IDS.CATEGORY]: category?.name ?? '',
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: hasExplicitFlagAmount(maxExpenseAmount) ? convertToFrontendAmountAsString(maxExpenseAmount, getCurrencyDecimals(policyCurrency)) : '',
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: category?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
    };
}

function getEffectiveFlagForReviewRuleForm(
    category: PolicyCategory | undefined,
    form: Partial<FlagForReviewRuleForm>,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    policyCurrency: string,
): FlagForReviewRuleForm {
    const categoryForm = getFlagForReviewFormFromCategory(category, getCurrencyDecimals, policyCurrency);

    return {
        [INPUT_IDS.CATEGORY]: form[INPUT_IDS.CATEGORY] ?? categoryForm[INPUT_IDS.CATEGORY] ?? '',
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: form[INPUT_IDS.MAX_EXPENSE_AMOUNT] ?? categoryForm[INPUT_IDS.MAX_EXPENSE_AMOUNT] ?? '',
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: form[INPUT_IDS.EXPENSE_LIMIT_TYPE] ?? categoryForm[INPUT_IDS.EXPENSE_LIMIT_TYPE] ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
    };
}

function saveFlagForReviewRule(policyID: string, policyCategories: PolicyCategories | undefined, form: FlagForReviewRuleForm) {
    const categoryName = form[INPUT_IDS.CATEGORY];
    if (!categoryName) {
        return;
    }

    setPolicyCategoryMaxAmount(
        policyID,
        categoryName,
        form[INPUT_IDS.MAX_EXPENSE_AMOUNT] ?? '',
        form[INPUT_IDS.EXPENSE_LIMIT_TYPE] ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
        policyCategories,
    );
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
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    isOffline: boolean;
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
        if (!category?.enabled) {
            continue;
        }

        const pendingFields = category.pendingFields;
        const pendingAction = pendingFields?.maxExpenseAmount;
        const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        if (!isOffline && isPendingDelete) {
            continue;
        }

        if (!hasExplicitFlagAmount(category.maxExpenseAmount) && !isPendingDelete) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const amountDisplay = convertToDisplayString(category.maxExpenseAmount, policyCurrency);
        const expenseLimitType = category.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;
        const conditionText =
            expenseLimitType === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY
                ? translate('workspace.rules.flagForReviewTable.conditionCategoryAndDailyAmount', decodedCategoryName, amountDisplay)
                : translate('workspace.rules.flagForReviewTable.conditionCategoryAndAmount', decodedCategoryName, amountDisplay);

        rules.push({
            keyForList: categoryName,
            ruleID: categoryName,
            categoryName,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [decodedCategoryName, conditionText, ruleDescription, typeLabel],
            pendingAction: pendingFields?.maxExpenseAmount,
            disabled: pendingFields?.maxExpenseAmount === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            action: () => onNavigate(getFlagForReviewRuleNavigationRoute(policyID, categoryName)),
        });
    }

    return rules;
}

function countCategoriesWithFlagForReviewRules(policyCategories: PolicyCategories | undefined): number {
    if (!policyCategories) {
        return 0;
    }

    return Object.values(policyCategories).filter((category) => category?.enabled && hasExplicitFlagAmount(category.maxExpenseAmount)).length;
}

export {
    countCategoriesWithFlagForReviewRules,
    deleteFlagForReviewRule,
    getEffectiveFlagForReviewRuleForm,
    getFlagForReviewFormFromCategory,
    getFlagForReviewRuleAmountError,
    getFlagForReviewTableData,
    saveFlagForReviewRule,
};
export type {FlagForReviewTableItem};
