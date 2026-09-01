/**
 * Helpers for reading, shaping and identifying the category tax default rules stored in `policy.rules.expenseRules`.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseDefaultTableItem} from '@components/Tables/WorkspaceExpenseDefaultsTable';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
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

/**
 * Marks a rule row as deleting while the category or tax rate it depends on is itself being deleted.
 *
 * The backend drops the rule along with them, so this only borrows their pending state instead of writing one of its
 * own — nothing to roll back, and the row clears when the delete lands. Only deletion is borrowed: a disabled category
 * or tax keeps its rule, which fires again once it is re-enabled.
 */
function getRuleDeletionPendingAction(
    policy: Policy | undefined,
    policyCategories: PolicyCategories | undefined,
    categoryName: string | undefined,
    taxID: string | undefined,
): PendingAction | undefined {
    const isCategoryDeleting = !!categoryName && policyCategories?.[categoryName]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isTaxDeleting = !!taxID && policy?.taxRates?.taxes?.[taxID]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    return isCategoryDeleting || isTaxDeleting ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined;
}

function getCategoryTaxRulesTableData({
    policy,
    policyCategories,
    translate,
    isOffline,
    onNavigate,
}: {
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    onNavigate: (route: Route) => void;
}): ExpenseDefaultTableItem[] {
    if (!policy?.id) {
        return [];
    }

    const policyID = policy.id;
    const typeLabel = translate('workspace.rules.expenseDefaultsTable.update');
    const fieldLabel = translate('common.tax').toLowerCase();
    // The rule is both its category and its tax rate, so deleting either one takes it down.
    const getPendingAction = (rule: ExpenseRule) => getRuleDeletionPendingAction(policy, policyCategories, getRuleCategoryName(rule), rule.tax?.field_id_TAX?.externalID);

    return (
        getCategoryTaxRules(policy.rules?.expenseRules)
            // Online the delete resolves in a moment, so drop the row rather than flash it greyed. Offline it stays,
            // styled as deleting, since there is nothing to wait for.
            .filter((rule) => isOffline || getPendingAction(rule) !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((rule) => {
                // `getCategoryTaxRules` already dropped the rules without a category, so this is always set.
                const categoryName = getRuleCategoryName(rule) ?? '';
                const decodedCategoryName = getDecodedCategoryName(categoryName);
                const taxID = rule.tax?.field_id_TAX?.externalID;
                const taxDisplayName = getTaxRateDisplayName(policy, taxID);
                const conditionText = translate('workspace.rules.expenseDefaultsTable.categoryIs', decodedCategoryName);
                const ruleDescription = translate('workspace.rules.merchantRules.ruleSummarySubtitleUpdateField', fieldLabel, taxDisplayName);
                const pendingAction = getPendingAction(rule);

                return {
                    keyForList: getCategoryTaxRuleKey(categoryName),
                    ruleID: getCategoryTaxRuleKey(categoryName),
                    section: CONST.POLICY.EXPENSE_DEFAULTS_SECTION.CATEGORIES,
                    isRename: false,
                    typeLabel,
                    conditionText,
                    ruleDescription,
                    searchTokens: [decodedCategoryName, conditionText, ruleDescription, taxDisplayName],
                    pendingAction,
                    disabled: pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    action: () => onNavigate(ROUTES.RULES_CATEGORY_TAX_EDIT.getRoute(policyID, categoryName)),
                };
            })
    );
}

/** The category a rule key from the Expense defaults table refers to. */
function getCategoryNameFromTaxRuleKey(key: string): string {
    return key.slice(CATEGORY_TAX_RULE_KEY_PREFIX.length);
}

export {
    categoryHasTaxRule,
    getCategoryNameFromTaxRuleKey,
    getCategoryTaxRulesTableData,
    getCategoryTaxRuleTaxID,
    getRuleCategoryName,
    getRuleDeletionPendingAction,
    getTaxRateDisplayName,
    isCategoryTaxRuleKey,
};
