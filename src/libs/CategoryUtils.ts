import {Str} from 'expensify-common';
import type {OnyxCollection} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, TaxRate, TaxRatesWithDefault} from '@src/types/onyx';
import type {ApprovalRule, ExpenseRule, MccGroup} from '@src/types/onyx/Policy';
import {convertToDisplayString} from './CurrencyUtils';

function formatDefaultTaxRateText(translate: LocaleContextProps['translate'], taxID: string, taxRate: TaxRate, policyTaxRates?: TaxRatesWithDefault) {
    const taxRateText = `${taxRate.name} ${CONST.DOT_SEPARATOR} ${taxRate.value}`;

    if (!policyTaxRates) {
        return taxRateText;
    }

    const {defaultExternalID, foreignTaxDefault} = policyTaxRates;
    let suffix;

    if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
        suffix = translate('common.default');
    } else if (taxID === defaultExternalID) {
        suffix = translate('workspace.taxes.workspaceDefault');
    } else if (taxID === foreignTaxDefault) {
        suffix = translate('workspace.taxes.foreignDefault');
    }
    return `${taxRateText}${suffix ? ` ${CONST.DOT_SEPARATOR} ${suffix}` : ``}`;
}

function formatRequireReceiptsOverText(translate: LocaleContextProps['translate'], policy: Policy, categoryMaxAmountNoReceipt?: number | null) {
    const isAlwaysSelected = categoryMaxAmountNoReceipt === 0;
    const isNeverSelected = categoryMaxAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;

    if (isAlwaysSelected) {
        return translate(`workspace.rules.categoryRules.requireReceiptsOverList.always`);
    }

    if (isNeverSelected) {
        return translate(`workspace.rules.categoryRules.requireReceiptsOverList.never`);
    }

    if (policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoReceipt === undefined) {
        return translate(`workspace.rules.categoryRules.requireReceiptsOverList.never`);
    }

    return translate(`workspace.rules.categoryRules.requireReceiptsOverList.default`, convertToDisplayString(policy.maxExpenseAmountNoReceipt, policy?.outputCurrency ?? CONST.CURRENCY.USD));
}

function formatRequireItemizedReceiptsOverText(translate: LocaleContextProps['translate'], policy: Policy, categoryMaxAmountNoItemizedReceipt?: number | null) {
    const isAlwaysSelected = categoryMaxAmountNoItemizedReceipt === 0;
    const isNeverSelected = categoryMaxAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;

    if (isAlwaysSelected) {
        return translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.always`);
    }

    if (isNeverSelected) {
        return translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.never`);
    }

    if (policy?.maxExpenseAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoItemizedReceipt === undefined) {
        return translate(`workspace.rules.categoryRules.requireItemizedReceiptsOverList.never`);
    }

    return translate(
        `workspace.rules.categoryRules.requireItemizedReceiptsOverList.default`,
        convertToDisplayString(policy.maxExpenseAmountNoItemizedReceipt, policy?.outputCurrency ?? CONST.CURRENCY.USD),
    );
}

function getCategoryApproverRule(approvalRules: ApprovalRule[], categoryName: string) {
    const approverRule = approvalRules?.find((rule) =>
        rule.applyWhen.find(({condition, field, value}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.CATEGORY && value === categoryName),
    );
    return approverRule;
}

function getCategoryExpenseRule(expenseRules: ExpenseRule[], categoryName: string) {
    const expenseRule = expenseRules?.find((rule) =>
        rule.applyWhen.find(({condition, field, value}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.CATEGORY && value === categoryName),
    );
    return expenseRule;
}

function getCategoryDefaultTaxRate(expenseRules: ExpenseRule[], categoryName: string, defaultTaxRate?: string) {
    const categoryDefaultTaxRate = expenseRules?.find((rule) => rule.applyWhen.some((when) => when.value === categoryName))?.tax?.field_id_TAX?.externalID;

    // If the default taxRate is not found in expenseRules, use the default value for policy
    if (!categoryDefaultTaxRate) {
        return defaultTaxRate;
    }

    return categoryDefaultTaxRate;
}

function updateCategoryInMccGroup(mccGroups: Record<string, MccGroup>, oldCategoryName: string, newCategoryName: string, shouldClearPendingAction?: boolean) {
    if (oldCategoryName === newCategoryName) {
        return mccGroups;
    }

    const updatedGroups: Record<string, MccGroup> = {};

    for (const [key, group] of Object.entries(mccGroups || {})) {
        updatedGroups[key] =
            group.category === oldCategoryName ? {...group, category: newCategoryName, pendingAction: shouldClearPendingAction ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE} : group;
    }

    return updatedGroups;
}

/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(policyCategories: PolicyCategories | undefined): number {
    if (policyCategories === undefined) {
        return 0;
    }
    return Object.values(policyCategories).filter((policyCategory) => policyCategory.enabled).length;
}

function isCategoryMissing(category: string | undefined): boolean {
    if (!category) {
        return true;
    }

    return category === CONST.SEARCH.CATEGORY_EMPTY_VALUE || category === CONST.SEARCH.CATEGORY_DEFAULT_VALUE;
}

function isCategoryDescriptionRequired(policyCategories: PolicyCategories | undefined, category: string | undefined, areRulesEnabled: boolean | undefined): boolean {
    if (!policyCategories || !category || !areRulesEnabled) {
        return false;
    }
    return !!policyCategories[category]?.areCommentsRequired;
}

function getDecodedCategoryName(categoryName: string) {
    return Str.htmlDecode(categoryName);
}

function getAvailableNonPersonalPolicyCategories(policyCategories: OnyxCollection<PolicyCategories>, personalPolicyID: string | undefined) {
    return Object.fromEntries(
        Object.entries(policyCategories ?? {}).filter(([key, categories]) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${personalPolicyID}`) {
                return false;
            }
            const availableCategories = Object.values(categories ?? {}).filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            return availableCategories.length > 0;
        }),
    );
}

export {
    formatDefaultTaxRateText,
    formatRequireReceiptsOverText,
    formatRequireItemizedReceiptsOverText,
    getCategoryApproverRule,
    getCategoryExpenseRule,
    getCategoryDefaultTaxRate,
    updateCategoryInMccGroup,
    getEnabledCategoriesCount,
    isCategoryMissing,
    isCategoryDescriptionRequired,
    getDecodedCategoryName,
    getAvailableNonPersonalPolicyCategories,
};
