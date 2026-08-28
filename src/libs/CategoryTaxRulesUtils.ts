/**
 * Helpers for reading, shaping and identifying the category tax default rules stored in `policy.rules.expenseRules`.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {MerchantRuleForm} from '@src/types/form/MerchantRuleForm';
import INPUT_IDS from '@src/types/form/MerchantRuleForm';
import type {Policy} from '@src/types/onyx';
import type {ExpenseRule} from '@src/types/onyx/Policy';

import {getDecodedCategoryName} from './CategoryUtils';

const CATEGORY_TAX_RULE_KEY_PREFIX = 'category-tax:';

function getCategoryTaxRuleKey(categoryName: string) {
    return `${CATEGORY_TAX_RULE_KEY_PREFIX}${categoryName}`;
}

function isCategoryTaxRuleKey(key: string) {
    return key.startsWith(CATEGORY_TAX_RULE_KEY_PREFIX);
}

/** The category a rule matches on. A category tax default only ever carries the one `category matches <name>` condition. */
function getRuleCategoryName(rule: ExpenseRule): string | undefined {
    return rule.applyWhen?.find(({condition, field}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.CATEGORY)?.value;
}

/** Only rules with an explicit tax default. `getCategoryDefaultTaxRate` falls back to the workspace default, which
 * would make every category look covered. */
function getCategoryTaxRules(expenseRules: ExpenseRule[] | undefined): ExpenseRule[] {
    return (expenseRules ?? []).filter((rule) => !!rule.tax?.field_id_TAX?.externalID && !!getRuleCategoryName(rule));
}

function getCategoryTaxRule(expenseRules: ExpenseRule[] | undefined, categoryName: string): ExpenseRule | undefined {
    return getCategoryTaxRules(expenseRules).find((rule) => getRuleCategoryName(rule) === categoryName);
}

function categoryHasTaxRule(expenseRules: ExpenseRule[] | undefined, categoryName: string): boolean {
    return !!getCategoryTaxRule(expenseRules, categoryName);
}

function getCategoryTaxRuleTaxID(expenseRules: ExpenseRule[] | undefined, categoryName: string): string | undefined {
    return getCategoryTaxRule(expenseRules, categoryName)?.tax?.field_id_TAX?.externalID;
}

/** The `Name (Value)` tax label. Prefers the workspace rate so renames read correctly, then the label the rule saved
 * inline, then the raw ID. */
function getTaxRateDisplayName(policy: Policy | undefined, taxID: string | undefined, savedTaxRate?: {name?: string; value?: string}): string {
    if (!taxID) {
        return '';
    }
    const taxRate = policy?.taxRates?.taxes?.[taxID];
    if (taxRate) {
        return `${taxRate.name} (${taxRate.value})`;
    }
    if (savedTaxRate?.name && savedTaxRate.value) {
        return `${savedTaxRate.name} (${savedTaxRate.value})`;
    }
    return taxID;
}

function getCategoryTaxRulesTableData({
    policy,
    translate,
    onNavigate,
}: {
    policy: Policy | undefined;
    translate: LocaleContextProps['translate'];
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    if (!policy?.id) {
        return [];
    }

    const policyID = policy.id;
    const typeLabel = translate('workspace.rules.expenseDefaultsTable.update');
    const fieldLabel = translate('common.tax').toLowerCase();

    return getCategoryTaxRules(policy.rules?.expenseRules).map((rule) => {
        // `getCategoryTaxRules` already dropped the rules without a category, so this is always set.
        const categoryName = getRuleCategoryName(rule) ?? '';
        const decodedCategoryName = getDecodedCategoryName(categoryName);
        const taxDisplayName = getTaxRateDisplayName(policy, rule.tax?.field_id_TAX?.externalID);
        const conditionText = translate('workspace.rules.expenseDefaultsTable.categoryIs', decodedCategoryName);
        const ruleDescription = translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabel, taxDisplayName);

        return {
            keyForList: getCategoryTaxRuleKey(categoryName),
            ruleID: getCategoryTaxRuleKey(categoryName),
            section: CONST.POLICY.EXPENSE_DEFAULTS_SECTION.CATEGORIES,
            isRename: false,
            typeLabel,
            conditionText,
            ruleDescription,
            searchTokens: [decodedCategoryName, conditionText, ruleDescription, taxDisplayName],
            action: () => onNavigate(ROUTES.RULES_CATEGORY_TAX_EDIT.getRoute(policyID, categoryName)),
        };
    });
}

/** The category a rule key from the Expense defaults table refers to. */
function getCategoryNameFromTaxRuleKey(key: string): string {
    return key.slice(CATEGORY_TAX_RULE_KEY_PREFIX.length);
}

/** The defaults a category rule can't carry. A category rule only ever sets a tax. */
const INCOMPATIBLE_CATEGORY_RULE_DEFAULT_KEYS = [
    INPUT_IDS.MERCHANT,
    INPUT_IDS.CATEGORY,
    INPUT_IDS.TAG,
    INPUT_IDS.DESCRIPTION,
    INPUT_IDS.VENDOR_ID,
    INPUT_IDS.REIMBURSABLE,
    INPUT_IDS.BILLABLE,
] as const;

/** Whether the draft holds defaults a category rule can't carry. They'd be dropped on save, so the picker warns first. */
function hasIncompatibleCategoryRuleDefaults(form: MerchantRuleForm | undefined): boolean {
    if (!form) {
        return false;
    }

    return INCOMPATIBLE_CATEGORY_RULE_DEFAULT_KEYS.some((key) => {
        const value = form[key];
        return typeof value === 'boolean' || (value !== undefined && value !== '');
    });
}

export {
    categoryHasTaxRule,
    getCategoryNameFromTaxRuleKey,
    getCategoryTaxRulesTableData,
    getCategoryTaxRuleTaxID,
    getRuleCategoryName,
    getTaxRateDisplayName,
    hasIncompatibleCategoryRuleDefaults,
    isCategoryTaxRuleKey,
};
