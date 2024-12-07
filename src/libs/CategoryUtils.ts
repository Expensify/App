import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Policy, TaxRate, TaxRatesWithDefault} from '@src/types/onyx';
import type {ApprovalRule, ExpenseRule, MccGroup} from '@src/types/onyx/Policy';
import * as CurrencyUtils from './CurrencyUtils';

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

    const maxExpenseAmountToDisplay = policy?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy?.maxExpenseAmount;

    return translate(`workspace.rules.categoryRules.requireReceiptsOverList.default`, {
        defaultAmount: CurrencyUtils.convertToShortDisplayString(maxExpenseAmountToDisplay, policy?.outputCurrency ?? CONST.CURRENCY.USD),
    });
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

export {formatDefaultTaxRateText, formatRequireReceiptsOverText, getCategoryApproverRule, getCategoryExpenseRule, getCategoryDefaultTaxRate, updateCategoryInMccGroup};
