import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';
import type {Policy, PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {CategoryFlagLimit, CategoryFlagLimits} from '@selectors/Rule';

import type {OnboardingTaskCompletionOnyxData} from './actions/Task';

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

/** A cold category link can expose only its RHP suffix until the underlay mounts. */
function qualifyCategoryFlagRulePath(policyID: string, path: string): string {
    const suffix = path.replace(/^\//, '');
    if (suffix.startsWith(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(''))) {
        return `${ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)}/${suffix}`;
    }
    if (suffix.startsWith(DYNAMIC_ROUTES.SETTINGS_CATEGORY_SETTINGS.getRoute(''))) {
        return `${ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID)}/${suffix}`;
    }
    return path;
}

function getMirroredCategoryFlagLimit(category: PolicyCategory, limits: CategoryFlagLimits | undefined): CategoryFlagLimit | undefined {
    if (!limits || category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        return undefined;
    }
    const migrationID = category.maxExpenseAmountMigrationID;
    // A queued rename changes the category name before Auth can send the updated rule.
    if (category.pendingFields?.name) {
        if (!migrationID) {
            return undefined;
        }
        const ruleKey = `${ONYXKEYS.COLLECTION.RULE}${migrationID}`;
        return Object.values(limits).find((limit) => limit?.ruleKey === ruleKey);
    }
    return Object.hasOwn(limits, category.name) ? limits[category.name] : undefined;
}

function getCategoryFlagLimit(category: PolicyCategory | undefined, limits: CategoryFlagLimits | undefined, policyCurrency: string): CategoryFlagLimit | undefined {
    if (!category) {
        return undefined;
    }

    const limit = getMirroredCategoryFlagLimit(category, limits);
    const pendingAction = category.pendingFields?.maxExpenseAmount;
    const {UPDATE, DELETE} = CONST.RED_BRICK_ROAD_PENDING_ACTION;
    // Legacy writes only update the category until Auth mirrors the change into the rules collection.
    if ((pendingAction === UPDATE || (pendingAction === DELETE && !limit)) && hasExplicitFlagAmount(category.maxExpenseAmount)) {
        return {
            amount: category.maxExpenseAmount,
            currency: policyCurrency,
            expenseLimitType: category.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
        };
    }

    return limit;
}

function hasFlagForReviewRuleForLegacyWrite(category: PolicyCategory | undefined, limits: CategoryFlagLimits | undefined): boolean {
    // The legacy write can overwrite a limit even when the rules collection has not synced yet.
    return !!category && (hasExplicitFlagAmount(category.maxExpenseAmount) || !!getMirroredCategoryFlagLimit(category, limits));
}

function getFlagForReviewFormFromLimit(categoryName: string, limit: CategoryFlagLimit, getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals']): FlagForReviewRuleForm {
    return {
        [INPUT_IDS.CATEGORY]: categoryName,
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: convertToFrontendAmountAsString(limit.amount, getCurrencyDecimals(limit.currency)),
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: limit.expenseLimitType,
    };
}

function saveFlagForReviewRule(
    policyID: string,
    policyCategories: PolicyCategories | undefined,
    form: FlagForReviewRuleForm,
    originalCategoryName?: string,
    reviewWorkspaceSettingsTaskData: OnboardingTaskCompletionOnyxData = {},
) {
    const categoryName = form[INPUT_IDS.CATEGORY];
    if (!categoryName) {
        return;
    }

    // Drained to {} after the first write so this save's optimistic task tick fires exactly once, even though it can trigger two API.write calls below.
    let remainingTaskData = reviewWorkspaceSettingsTaskData;

    if (originalCategoryName && originalCategoryName !== categoryName) {
        deleteFlagForReviewRule(policyID, originalCategoryName, policyCategories, remainingTaskData);
        remainingTaskData = {};
    }

    setPolicyCategoryMaxAmount(
        policyID,
        categoryName,
        form[INPUT_IDS.MAX_EXPENSE_AMOUNT] ?? '',
        form[INPUT_IDS.EXPENSE_LIMIT_TYPE] ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE,
        policyCategories,
        remainingTaskData,
    );
}

function deleteFlagForReviewRule(
    policyID: string,
    categoryName: string,
    policyCategories: PolicyCategories | undefined,
    reviewWorkspaceSettingsTaskData: OnboardingTaskCompletionOnyxData = {},
) {
    const category = policyCategories?.[categoryName];
    const expenseLimitType = category?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;

    setPolicyCategoryMaxAmount(policyID, categoryName, '', expenseLimitType, policyCategories, reviewWorkspaceSettingsTaskData);
}

function getFlagForReviewTableData({
    policy,
    policyCategories,
    categoryFlagLimits,
    translate,
    convertToDisplayString,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    categoryFlagLimits: CategoryFlagLimits | undefined;
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

        const pendingAction = category.pendingFields?.maxExpenseAmount;
        const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        if (!isOffline && isPendingDelete) {
            continue;
        }

        const limit = getCategoryFlagLimit(category, categoryFlagLimits, policyCurrency);
        if (!limit) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const amountDisplay = convertToDisplayString(limit.amount, limit.currency);
        const conditionText =
            limit.expenseLimitType === CONST.POLICY.EXPENSE_LIMIT_TYPES.DAILY
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
            pendingAction,
            disabled: isPendingDelete,
            action: () => onNavigate(getFlagForReviewRuleNavigationRoute(policyID, categoryName)),
        });
    }

    return rules;
}

export {
    deleteFlagForReviewRule,
    getCategoryFlagLimit,
    getFlagForReviewFormFromLimit,
    getFlagForReviewRuleAmountError,
    getFlagForReviewTableData,
    hasExplicitFlagAmount,
    hasFlagForReviewRuleForLegacyWrite,
    qualifyCategoryFlagRulePath,
    saveFlagForReviewRule,
};
export type {FlagForReviewTableItem};
