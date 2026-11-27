import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {FlagForReviewRuleForm, FlagMerchantMatchType} from '@src/types/form/FlagForReviewRuleForm';
import type {PolicyCategories, PolicyCategory, Rule} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import type {FlagForReviewRule, FlagRuleEnforcement} from '@src/types/onyx/Rule';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import type {FlagForReviewRules} from '@selectors/Rule';

import {getDecodedCategoryName} from './CategoryUtils';
import {convertToBackendAmount, convertToFrontendAmountAsString} from './CurrencyUtils';
import {fromIndexMap, isRuleFilterComparison, isRuleFilterNode, toIndexMap} from './RuleUtils';
import {formatAmountFilterValue, parseAmountFilterValue} from './SearchAmountFilterUtils';

type FlagAmountLimit = {
    /** Amount in backend hundredths, including for zero-decimal currencies. */
    amount: number;
    currency: string;
    expenseLimitType: PolicyCategoryExpenseLimitType;
};

type FlagForReviewConditions = {
    categoryName?: string;
    merchant?: {name: string; matchType: FlagMerchantMatchType};
    limit?: FlagAmountLimit;
    enforcement?: FlagRuleEnforcement;
};

type CategoryFlagLimits = Partial<Record<string, FlagAmountLimit & {ruleID: string; pendingAction?: PendingAction}>>;

type FlagForReviewTableItem = TableData & {
    ruleID: string;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
    pendingAction?: PendingAction;
    action: () => void;
};

const {ACTIONS, TRIGGERS, DAILY_BUDGET_FILTER} = CONST.RULES;
const {WARNING, BLOCK} = CONST.RULES.FLAG_FOR_REVIEW.ENFORCEMENT;
const {AND, CONTAINS, EQUAL_TO, GREATER_THAN} = CONST.SEARCH.SYNTAX_OPERATORS;
const {CATEGORY, AMOUNT, MERCHANT} = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const {DAILY, EXPENSE} = CONST.POLICY.EXPENSE_LIMIT_TYPES;

function hasExplicitFlagAmount(maxExpenseAmount: number | null | undefined): maxExpenseAmount is number {
    return maxExpenseAmount !== null && maxExpenseAmount !== undefined && maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

function isFlagMerchantMatchType(operator: string): operator is FlagMerchantMatchType {
    return operator === CONTAINS || operator === EQUAL_TO;
}

function getFlagForReviewRuleAmountError(
    maxExpenseAmount: string | undefined,
    translate: LocaleContextProps['translate'],
    expenseLimitType?: PolicyCategoryExpenseLimitType,
): string | undefined {
    const enteredAmount = Number(maxExpenseAmount);
    const amount = convertToBackendAmount(enteredAmount);
    const isValidAmount = maxExpenseAmount?.trim() && Number.isSafeInteger(amount) && enteredAmount >= 0 && (expenseLimitType !== DAILY || amount > 0);
    return isValidAmount ? undefined : translate('workspace.rules.flagForReviewRule.confirmErrorAmount');
}

function canMatchFlagRuleCategory(category: PolicyCategory | undefined): boolean {
    const {ADD, DELETE} = CONST.RED_BRICK_ROAD_PENDING_ACTION;
    return !!category && category.pendingAction !== ADD && category.pendingAction !== DELETE && (!category.pendingFields?.name || !!category.maxExpenseAmountMigrationID);
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

function getCategoryFlagLimit(category: PolicyCategory | undefined, limits: CategoryFlagLimits | undefined) {
    if (!category || !limits || category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        return undefined;
    }

    // A queued rename changes the category name before the server can update the filter.
    if (category.pendingFields?.name) {
        if (!category.maxExpenseAmountMigrationID) {
            return undefined;
        }
        return Object.values(limits).find((limit) => limit?.ruleID === String(category.maxExpenseAmountMigrationID));
    }

    return Object.hasOwn(limits, category.name) ? limits[category.name] : undefined;
}

function getFlagComparisons(filters: RuleFilterNode | undefined): RuleFilterComparison[] | undefined {
    if (!isRuleFilterNode(filters)) {
        return undefined;
    }
    if (isRuleFilterComparison(filters)) {
        return [filters];
    }
    if (filters.operator !== AND) {
        return undefined;
    }
    const left = getFlagComparisons(filters.left);
    const right = getFlagComparisons(filters.right);
    return left && right ? [...left, ...right] : undefined;
}

function getFlagForReviewConditions(rule: Rule | undefined): FlagForReviewConditions | undefined {
    if (!rule) {
        return undefined;
    }
    const actions = fromIndexMap<{name: string; enforcement?: FlagRuleEnforcement}>(rule.actions);
    const action = actions.at(0);
    const triggers = fromIndexMap<string>(rule.triggers);
    // Don't open rules that this editor can't save without dropping behavior.
    if (
        actions.length !== 1 ||
        action?.name !== ACTIONS.TRIGGER_VIOLATION ||
        Object.keys(action).some((key) => key !== 'name' && key !== 'enforcement') ||
        triggers.length !== 2 ||
        !triggers.includes(TRIGGERS.CREATE_TRANSACTION) ||
        !triggers.includes(TRIGGERS.UPDATE_TRANSACTION)
    ) {
        return undefined;
    }
    const {enforcement} = action;
    if (enforcement !== undefined && enforcement !== WARNING && enforcement !== BLOCK) {
        return undefined;
    }

    const comparisons = getFlagComparisons(rule.filters);
    if (!comparisons) {
        return undefined;
    }
    let categoryName: string | undefined;
    let merchant: FlagForReviewConditions['merchant'];
    let limit: FlagAmountLimit | undefined;
    for (const {left, right, operator} of comparisons) {
        if (typeof right !== 'string' || !right.trim()) {
            return undefined;
        }
        if (left === CATEGORY && operator === EQUAL_TO && !categoryName) {
            categoryName = right;
        } else if (left === MERCHANT && isFlagMerchantMatchType(operator) && !merchant) {
            merchant = {name: right, matchType: operator};
        } else if ((left === AMOUNT || left === DAILY_BUDGET_FILTER) && operator === GREATER_THAN && !limit) {
            const {amount, currency} = parseAmountFilterValue(right.trim());
            const amountInHundredths = convertToBackendAmount(Number(amount));
            if (!currency || !Number.isSafeInteger(amountInHundredths) || amountInHundredths < 0) {
                return undefined;
            }
            limit = {amount: amountInHundredths, currency, expenseLimitType: left === DAILY_BUDGET_FILTER ? DAILY : EXPENSE};
        } else {
            return undefined;
        }
    }
    if (limit?.expenseLimitType === DAILY ? !categoryName || !!merchant || limit.amount === 0 : !merchant && !(categoryName && limit)) {
        return undefined;
    }
    return {categoryName, merchant, limit, enforcement};
}

function getFlagForReviewDraft(conditions: FlagForReviewConditions, getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals']): Partial<FlagForReviewRuleForm> {
    const {categoryName, merchant, limit, enforcement} = conditions;
    return {
        category: categoryName,
        merchantToMatch: merchant?.name,
        matchType: merchant?.matchType,
        maxExpenseAmount: limit ? convertToFrontendAmountAsString(limit.amount, getCurrencyDecimals(limit.currency)) : undefined,
        expenseLimitType: limit?.expenseLimitType,
        currency: limit?.currency,
        enforcement,
    };
}

function getFlagForReviewDraftKey(policyID: string, ruleID?: string, categoryName?: string): string {
    const createKey = categoryName ? `${ROUTES.NEW}/${encodeURIComponent(categoryName)}` : ROUTES.NEW;
    return `${policyID}/${ruleID ?? createKey}`;
}

function getDescribedFlagForReviewDraft(policyID: string, {category, maxExpenseAmount, expenseLimitType}: Partial<FlagForReviewRuleForm>): Partial<FlagForReviewRuleForm> {
    return {category, maxExpenseAmount, expenseLimitType, draftKey: getFlagForReviewDraftKey(policyID)};
}

function buildFlagForReviewRule(form: Partial<FlagForReviewRuleForm>, currency: string, enforcement: FlagRuleEnforcement | undefined): FlagForReviewRule | undefined {
    const {category, merchantToMatch, matchType, maxExpenseAmount, expenseLimitType} = form;
    const merchant = merchantToMatch?.trim();
    const threshold = formatAmountFilterValue(maxExpenseAmount ?? '', currency);
    const isDaily = expenseLimitType === DAILY;
    const amount = convertToBackendAmount(Number(maxExpenseAmount));
    if ((maxExpenseAmount?.trim() && (!Number.isSafeInteger(amount) || Number(maxExpenseAmount) < 0)) || (isDaily && (!category || !!merchant || !(amount > 0)))) {
        return undefined;
    }

    const comparisons: RuleFilterComparison[] = [];
    if (category) {
        comparisons.push({left: CATEGORY, operator: EQUAL_TO, right: category});
    }
    if (merchant) {
        comparisons.push({left: MERCHANT, operator: matchType ?? CONTAINS, right: merchant});
    }
    if (threshold) {
        comparisons.push({left: isDaily ? DAILY_BUDGET_FILTER : AMOUNT, operator: GREATER_THAN, right: threshold});
    }
    const [first, ...remaining] = comparisons;
    if (!first || (!merchant && !(category && threshold))) {
        return undefined;
    }

    return {
        triggers: toIndexMap([TRIGGERS.CREATE_TRANSACTION, TRIGGERS.UPDATE_TRANSACTION]),
        filters: remaining.reduce<RuleFilterNode>((left, right) => ({left, operator: AND, right}), first),
        actions: toIndexMap([{name: ACTIONS.TRIGGER_VIOLATION, ...(enforcement ? {enforcement} : {})}]),
    };
}

function getFlagForReviewRulePriority(ruleID: string | undefined, categories: PolicyCategories | undefined): number {
    // GetRules doesn't include priority, but Auth identifies category mirrors by their migration ID.
    if (ruleID && Object.values(categories ?? {}).some((category) => String(category.maxExpenseAmountMigrationID) === ruleID)) {
        return CONST.RULES.FLAG_FOR_REVIEW.MIGRATED_CATEGORY_PRIORITY;
    }
    return CONST.RULES.FLAG_FOR_REVIEW.PRIORITY;
}

function getFlagRuleCategory(policyCategories: PolicyCategories | undefined, categoryName: string | undefined, ruleID: string) {
    if (!categoryName || !policyCategories) {
        return undefined;
    }

    // Migration IDs point at the rule even when two offline renames have changed its category name.
    const category = Object.hasOwn(policyCategories, categoryName) ? policyCategories[categoryName] : undefined;
    if (category && !category.pendingFields?.name && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        return category;
    }
    return Object.values(policyCategories).find((entry) => entry.pendingFields?.name && String(entry.maxExpenseAmountMigrationID) === ruleID) ?? category;
}

function getFlagForReviewTableData({
    policyID,
    policyCategories,
    flagRules,
    translate,
    convertToDisplayString,
    isOffline,
    onNavigate,
}: {
    policyID: string;
    policyCategories: PolicyCategories | undefined;
    flagRules: FlagForReviewRules | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): FlagForReviewTableItem[] {
    const typeLabel = translate('workspace.rules.flagForReviewTable.typeLabel');
    const rules: FlagForReviewTableItem[] = [];
    for (const [ruleID, {categoryName, merchant, limit, enforcement, pendingAction, hasErrors}] of Object.entries(flagRules ?? {})) {
        const category = getFlagRuleCategory(policyCategories, categoryName, ruleID);
        const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        if (category?.enabled === false || (!isOffline && isPendingDelete)) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(category?.name ?? categoryName ?? '');
        const amountDisplay = limit ? convertToDisplayString(limit.amount, limit.currency) : '';
        const categoryAndAmount =
            limit?.expenseLimitType === DAILY
                ? translate('workspace.rules.flagForReviewTable.conditionCategoryAndDailyAmount', decodedCategoryName, amountDisplay)
                : translate('workspace.rules.flagForReviewTable.conditionCategoryAndAmount', decodedCategoryName, amountDisplay);
        const merchantCondition = merchant
            ? translate(
                  merchant.matchType === EQUAL_TO ? 'workspace.rules.expenseDefaultsTable.merchantExactlyMatches' : 'workspace.rules.expenseDefaultsTable.merchantContains',
                  merchant.name,
              )
            : '';
        const conditionText = [
            merchantCondition,
            decodedCategoryName && amountDisplay ? categoryAndAmount : '',
            decodedCategoryName && !amountDisplay ? translate('workspace.rules.expenseDefaultsTable.categoryIs', decodedCategoryName) : '',
            !decodedCategoryName && amountDisplay ? translate('workspace.rules.spendRules.maxAmountAbove', {amount: amountDisplay}) : '',
        ]
            .filter(Boolean)
            .join(` ${translate('common.and')} `);
        const ruleDescription = translate(enforcement === BLOCK ? 'workspace.rules.spendRules.block' : 'workspace.rules.flagForReviewTable.flagForReview');

        rules.push({
            keyForList: ruleID,
            ruleID,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [conditionText, ruleDescription, typeLabel],
            pendingAction,
            disabled: isPendingDelete,
            isSelectionDisabled: !!pendingAction && !hasErrors,
            action: () => onNavigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleID)),
        });
    }
    return rules;
}

export {
    buildFlagForReviewRule,
    canMatchFlagRuleCategory,
    getCategoryFlagLimit,
    getDescribedFlagForReviewDraft,
    getFlagForReviewConditions,
    getFlagForReviewDraft,
    getFlagForReviewDraftKey,
    getFlagForReviewRuleAmountError,
    getFlagForReviewRulePriority,
    getFlagForReviewTableData,
    getFlagRuleCategory,
    hasExplicitFlagAmount,
    isFlagMerchantMatchType,
    qualifyCategoryFlagRulePath,
};
export type {CategoryFlagLimits, FlagForReviewConditions, FlagForReviewTableItem};
