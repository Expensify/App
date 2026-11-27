import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TableData} from '@components/Table';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {FlagForReviewRuleForm, FlagMerchantMatchType} from '@src/types/form/FlagForReviewRuleForm';
import type {Policy, PolicyCategories, PolicyCategory, Rule} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import type {FlagForReviewRule, FlagRuleEnforcement} from '@src/types/onyx/Rule';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';

import type {FlagForReviewRules} from '@selectors/Rule';

import {Str} from 'expensify-common';

import type {EditableConditions} from './ExpenseDefaultRuleUtils';
import type {ExpenseDefaultConditionNames} from './MerchantTypeRulesUtils';

import {getDecodedCategoryName} from './CategoryUtils';
import {convertToBackendAmount, convertToFrontendAmountAsString} from './CurrencyUtils';
import {buildExpenseConditionComparisons, getConditionFromLeaf, HAS_OPTIONS} from './ExpenseDefaultRuleUtils';
import {getOtherConditionText} from './MerchantTypeRulesUtils';
import {getCleanedTagName} from './PolicyUtils';
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
    dailyBudget?: FlagAmountLimit;
    matchingConditions: RuleFilterComparison[];
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
const {CATEGORY, AMOUNT, MERCHANT, FROM, TAG} = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const {DAILY, EXPENSE} = CONST.POLICY.EXPENSE_LIMIT_TYPES;
const DEFAULT_BUDGET_TAG_LEVEL = 1;
const BUDGET_SUBMITTER_ID = /^[1-9]\d*$/;

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
    if (filters.operator !== AND || Object.keys(filters).length !== 3) {
        return undefined;
    }
    const left = getFlagComparisons(filters.left);
    const right = getFlagComparisons(filters.right);
    return left && right ? [...left, ...right] : undefined;
}

function parseFlagAmountLimit(operand: string, expenseLimitType: PolicyCategoryExpenseLimitType): FlagAmountLimit | undefined {
    const {amount, currency} = parseAmountFilterValue(operand);
    const amountInHundredths = convertToBackendAmount(Number(amount));
    if (!currency || !Number.isSafeInteger(amountInHundredths) || amountInHundredths < 0) {
        return undefined;
    }
    return {amount: amountInHundredths, currency, expenseLimitType};
}

function isValidBudgetTagLevel(level: number): boolean {
    return Number.isSafeInteger(level) && level >= DEFAULT_BUDGET_TAG_LEVEL;
}

function getFlagCategoryLimit(conditions: FlagForReviewConditions | undefined): FlagAmountLimit | undefined {
    if (!conditions?.categoryName || conditions.merchant || conditions.matchingConditions.length || (conditions.limit && conditions.dailyBudget)) {
        return undefined;
    }
    return conditions.limit ?? conditions.dailyBudget;
}

function getFlagTagDisplayName(value: string, translate: LocaleContextProps['translate'], tagLevel?: number): string {
    return tagLevel ? `${Str.htmlDecode(value)} (${translate('insightsPage.tagLevel', String(tagLevel))})` : getCleanedTagName(value);
}

function getFlagForReviewConditions(rule: Rule | FlagForReviewRule | undefined): FlagForReviewConditions | undefined {
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
    let dailyBudget: FlagAmountLimit | undefined;
    const matchingConditions: RuleFilterComparison[] = [];
    const seenFields = new Set<string>();
    const hasDailyBudget = comparisons.some(({left}) => left === DAILY_BUDGET_FILTER);
    for (const comparison of comparisons) {
        const {left, right, operator, tagLevel} = comparison;
        if (
            seenFields.has(left) ||
            Object.keys(comparison).some((key) => key !== 'left' && key !== 'right' && key !== 'operator' && !(key === 'tagLevel' && hasDailyBudget && left === TAG))
        ) {
            return undefined;
        }
        seenFields.add(left);
        const values = [right].flat();
        const first = values.length === 1 ? values.at(0) : undefined;
        if (left === CATEGORY && operator === EQUAL_TO && typeof first === 'string' && first.trim()) {
            categoryName = first;
        } else if (left === MERCHANT && isFlagMerchantMatchType(operator) && typeof first === 'string' && first.trim()) {
            merchant = {name: first, matchType: operator};
        } else if ((left === AMOUNT || left === DAILY_BUDGET_FILTER) && operator === GREATER_THAN && typeof first === 'string') {
            const amountLimit = parseFlagAmountLimit(first, left === DAILY_BUDGET_FILTER ? DAILY : EXPENSE);
            if (!amountLimit) {
                return undefined;
            }
            if (left === DAILY_BUDGET_FILTER) {
                dailyBudget = amountLimit;
            } else {
                limit = amountLimit;
            }
        } else {
            if (left === CATEGORY || left === MERCHANT || left === AMOUNT || left === DAILY_BUDGET_FILTER) {
                return undefined;
            }
            // Auth treats Category, Tag, and Submitter as budget selectors, not ordinary OR lists.
            const leaf = hasDailyBudget && left === FROM && typeof first === 'number' && Number.isSafeInteger(first) ? {...comparison, right: String(first)} : comparison;
            const conditions = getConditionFromLeaf(leaf);
            if (
                !conditions ||
                conditions.hasToMatch?.some((value) => !HAS_OPTIONS.some((option) => option === value)) ||
                (hasDailyBudget && left === FROM && !BUDGET_SUBMITTER_ID.test(String(first))) ||
                (hasDailyBudget && left === TAG && (typeof first !== 'string' || !first.trim() || !isValidBudgetTagLevel(tagLevel ?? DEFAULT_BUDGET_TAG_LEVEL)))
            ) {
                return undefined;
            }
            matchingConditions.push(leaf);
        }
    }
    return {categoryName, merchant, limit, dailyBudget, matchingConditions, enforcement};
}

function getFlagForReviewDraft(
    conditions: FlagForReviewConditions,
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'],
    usesCategoryLimitEditor = false,
): Partial<FlagForReviewRuleForm> {
    const {categoryName, merchant, limit, dailyBudget, matchingConditions, enforcement} = conditions;
    const categoryLimit = usesCategoryLimitEditor ? getFlagCategoryLimit(conditions) : undefined;
    const budgetTag = dailyBudget && matchingConditions.find(({left}) => left === TAG);
    const formatLimit = ({amount, currency}: FlagAmountLimit) => `${convertToFrontendAmountAsString(amount, CONST.DEFAULT_CURRENCY_DECIMALS)} ${currency}`;
    const conditionValues: EditableConditions = {};
    for (const leaf of matchingConditions) {
        Object.assign(conditionValues, getConditionFromLeaf(leaf));
    }
    return {
        ...conditionValues,
        category: categoryName,
        merchantToMatch: merchant?.name,
        matchType: merchant?.matchType,
        maxExpenseAmount: categoryLimit ? convertToFrontendAmountAsString(categoryLimit.amount, getCurrencyDecimals(categoryLimit.currency)) : undefined,
        expenseLimitType: categoryLimit?.expenseLimitType,
        currency: categoryLimit?.currency,
        amountToMatch: !usesCategoryLimitEditor && limit ? formatLimit(limit) : undefined,
        dailyBudgetToMatch: !usesCategoryLimitEditor && dailyBudget ? formatLimit(dailyBudget) : undefined,
        budgetTagLevel: budgetTag ? (budgetTag.tagLevel ?? DEFAULT_BUDGET_TAG_LEVEL) : undefined,
        enforcement,
    };
}

function getFlagForReviewDraftKey(policyID: string, ruleID?: string, categoryName?: string): string {
    const createKey = categoryName ? `${ROUTES.NEW}/${encodeURIComponent(categoryName)}` : ROUTES.NEW;
    return `${policyID}/${ruleID ?? createKey}`;
}

function getDescribedFlagForReviewDraft(policyID: string, currency: string, {category, maxExpenseAmount, expenseLimitType}: Partial<FlagForReviewRuleForm>): Partial<FlagForReviewRuleForm> {
    const amount = formatAmountFilterValue(maxExpenseAmount ?? '', currency);
    return {category, ...(expenseLimitType === DAILY ? {dailyBudgetToMatch: amount} : {amountToMatch: amount}), draftKey: getFlagForReviewDraftKey(policyID)};
}

function hasValidFlagBudgetSelectors({tagsToMatch, submittersToMatch, budgetTagLevel}: Partial<FlagForReviewRuleForm>): boolean {
    const tag = tagsToMatch?.at(0);
    const submitter = submittersToMatch?.at(0);
    return (
        (!tagsToMatch?.length || (tagsToMatch.length === 1 && !!tag?.trim() && isValidBudgetTagLevel(budgetTagLevel ?? 0))) &&
        (!submittersToMatch?.length || (submittersToMatch.length === 1 && !!submitter && BUDGET_SUBMITTER_ID.test(submitter)))
    );
}

function buildFlagForReviewRule(form: Partial<FlagForReviewRuleForm>, currency: string, enforcement: FlagRuleEnforcement | undefined): FlagForReviewRule | undefined {
    const {category, maxExpenseAmount, expenseLimitType, amountToMatch, dailyBudgetToMatch, budgetTagLevel, tagsToMatch} = form;
    const threshold = formatAmountFilterValue(maxExpenseAmount ?? '', currency);
    const expenseOperand = amountToMatch || (expenseLimitType !== DAILY ? threshold : '');
    const budgetOperand = dailyBudgetToMatch || (expenseLimitType === DAILY ? threshold : '');
    if (
        (maxExpenseAmount?.trim() && (!threshold || Number(maxExpenseAmount) < 0)) ||
        (expenseOperand && !parseFlagAmountLimit(expenseOperand, EXPENSE)) ||
        (budgetOperand && (!parseFlagAmountLimit(budgetOperand, DAILY) || !hasValidFlagBudgetSelectors(form))) ||
        (!budgetOperand && !!budgetTagLevel && !!tagsToMatch?.length) ||
        (expenseLimitType === DAILY && (!category || convertToBackendAmount(Number(maxExpenseAmount)) <= 0 || !budgetOperand))
    ) {
        return undefined;
    }

    const comparisons: RuleFilterComparison[] = [];
    if (category) {
        comparisons.push({left: CATEGORY, operator: EQUAL_TO, right: category});
    }
    const sharedComparisons = buildExpenseConditionComparisons({
        ...form,
        reimbursableToMatch: form.reimbursableToMatch === '' ? undefined : form.reimbursableToMatch,
        billableToMatch: form.billableToMatch === '' ? undefined : form.billableToMatch,
        amountToMatch: expenseOperand,
        amountMatchType: GREATER_THAN,
    });
    const budgetTag = budgetOperand ? tagsToMatch?.at(0) : undefined;
    for (const comparison of sharedComparisons) {
        const {left, right} = comparison;
        if (budgetOperand && Array.isArray(right)) {
            if (left === TAG && budgetTag && budgetTagLevel) {
                // The budget evaluator compares the decoded tag segment, not the serialized tag path.
                comparisons.push({...comparison, right: budgetTag, tagLevel: budgetTagLevel});
                continue;
            }
            if (left === FROM && right.length === 1 && right[0]) {
                comparisons.push({...comparison, right: right[0]});
                continue;
            }
        }
        comparisons.push(comparison);
    }
    if (budgetOperand) {
        comparisons.push({left: DAILY_BUDGET_FILTER, operator: GREATER_THAN, right: budgetOperand});
    }
    const [first, ...remaining] = comparisons;
    if (!first) {
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

function usesLegacyFlagLimitEditor(ruleID: string | undefined, categories: PolicyCategories | undefined, conditions: FlagForReviewConditions | undefined): boolean {
    return !!getFlagCategoryLimit(conditions) && (!conditions?.enforcement || getFlagForReviewRulePriority(ruleID, categories) === CONST.RULES.FLAG_FOR_REVIEW.MIGRATED_CATEGORY_PRIORITY);
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
    policy,
    flagRules,
    translate,
    convertToDisplayString,
    conditionNames = {},
    isOffline,
    onNavigate,
}: {
    policyID: string;
    policyCategories: PolicyCategories | undefined;
    policy?: Policy;
    flagRules: FlagForReviewRules | undefined;
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    conditionNames?: ExpenseDefaultConditionNames;
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): FlagForReviewTableItem[] {
    const typeLabel = translate('workspace.rules.flagForReviewTable.typeLabel');
    const rules: FlagForReviewTableItem[] = [];
    for (const [ruleID, {categoryName, merchant, limit, dailyBudget, matchingConditions, enforcement, pendingAction, hasErrors}] of Object.entries(flagRules ?? {})) {
        const category = getFlagRuleCategory(policyCategories, categoryName, ruleID);
        const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        if (category?.enabled === false || (!isOffline && isPendingDelete)) {
            continue;
        }

        const decodedCategoryName = getDecodedCategoryName(category?.name ?? categoryName ?? '');
        const amountDisplay = limit ? convertToDisplayString(limit.amount, limit.currency) : '';
        const budgetDisplay = dailyBudget ? convertToDisplayString(dailyBudget.amount, dailyBudget.currency) : '';
        const additionalConditions = matchingConditions.map(({left: field, operator, right, tagLevel}) => {
            const values = [right].flat().map(String);
            if (field === TAG) {
                const level = dailyBudget ? (tagLevel ?? DEFAULT_BUDGET_TAG_LEVEL) : undefined;
                return translate('workspace.rules.expenseDefaultsTable.tagIs', values.map((value) => getFlagTagDisplayName(value, translate, level)).join(', '));
            }
            return getOtherConditionText({field, operator, values}, translate, convertToDisplayString, policy, conditionNames);
        });
        const merchantCondition = merchant
            ? translate(
                  merchant.matchType === EQUAL_TO ? 'workspace.rules.expenseDefaultsTable.merchantExactlyMatches' : 'workspace.rules.expenseDefaultsTable.merchantContains',
                  merchant.name,
              )
            : '';
        const conditionText = [
            merchantCondition,
            decodedCategoryName && budgetDisplay ? translate('workspace.rules.flagForReviewTable.conditionCategoryAndDailyAmount', decodedCategoryName, budgetDisplay) : '',
            !decodedCategoryName && budgetDisplay ? translate('workspace.rules.flagForReviewRule.dailyBudgetOver', budgetDisplay) : '',
            decodedCategoryName && amountDisplay ? translate('workspace.rules.flagForReviewTable.conditionCategoryAndAmount', decodedCategoryName, amountDisplay) : '',
            decodedCategoryName && !amountDisplay && !budgetDisplay ? translate('workspace.rules.expenseDefaultsTable.categoryIs', decodedCategoryName) : '',
            !decodedCategoryName && amountDisplay ? translate('workspace.rules.spendRules.maxAmountAbove', {amount: amountDisplay}) : '',
            ...additionalConditions,
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
    getFlagCategoryLimit,
    getDescribedFlagForReviewDraft,
    getFlagForReviewConditions,
    getFlagForReviewDraft,
    getFlagForReviewDraftKey,
    getFlagForReviewRuleAmountError,
    getFlagForReviewRulePriority,
    getFlagForReviewTableData,
    getFlagRuleCategory,
    getFlagTagDisplayName,
    hasExplicitFlagAmount,
    hasValidFlagBudgetSelectors,
    isFlagMerchantMatchType,
    qualifyCategoryFlagRulePath,
    usesLegacyFlagLimitEditor,
};
export type {CategoryFlagLimits, FlagForReviewConditions, FlagForReviewTableItem};
