import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, TaxRate} from '@src/types/onyx';
import {getDecodedCategoryName} from './CategoryUtils';
import {getCleanedTagName} from './PolicyUtils';
import StringUtils from './StringUtils';

function formatExpenseRuleChanges(rule: ExpenseRule, translate: LocaleContextProps['translate']): string {
    const changes: string[] = [];

    const addRuleUpdate = (translationKey: TranslationPaths, translationKeyUpdate: TranslationPaths, value: string | boolean) => {
        return changes.push(translate(changes.length > 0 ? translationKey : translationKeyUpdate, value as TranslationParameters<TranslationPaths>[0]));
    };

    if (rule.billable) {
        addRuleUpdate('expenseRulesPage.changes.billable', 'expenseRulesPage.changes.updateBillable', rule.billable === 'true');
    }
    if (rule.category) {
        addRuleUpdate('expenseRulesPage.changes.category', 'expenseRulesPage.changes.updateCategory', getDecodedCategoryName(rule.category));
    }
    if (rule.comment) {
        addRuleUpdate('expenseRulesPage.changes.comment', 'expenseRulesPage.changes.updateComment', rule.comment);
    }
    if (rule.merchant) {
        addRuleUpdate('expenseRulesPage.changes.merchant', 'expenseRulesPage.changes.updateMerchant', rule.merchant);
    }
    if (rule.reimbursable) {
        addRuleUpdate('expenseRulesPage.changes.reimbursable', 'expenseRulesPage.changes.updateReimbursable', rule.reimbursable === 'true');
    }
    if (rule.tag) {
        addRuleUpdate('expenseRulesPage.changes.tag', 'expenseRulesPage.changes.updateTag', getCleanedTagName(rule.tag));
    }
    if (rule.tax?.field_id_TAX) {
        addRuleUpdate('expenseRulesPage.changes.tax', 'expenseRulesPage.changes.updateTax', rule.tax.field_id_TAX.value);
    }
    if (rule.report) {
        changes.push(translate('expenseRulesPage.changes.report', rule.report));
    }

    const formatted = changes.join(', ');

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function extractRuleFromForm(form: ExpenseRuleForm, taxRate?: TaxRate) {
    const rule: ExpenseRule = {
        billable: form.billable,
        category: form.category,
        comment: form.comment,
        createReport: form.createReport,
        merchant: form.merchant,
        merchantToMatch: form.merchantToMatch,
        reimbursable: form.reimbursable,
        report: form.report,
        tag: form.tag,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tax: form.tax && taxRate ? {field_id_TAX: {externalID: form.tax, value: taxRate.value}} : undefined,
    };
    return rule;
}

function getKeyForRule(rule: ExpenseRule) {
    // Use a stable key based on ordered properties
    const stableKey = [
        rule.merchantToMatch,
        rule.merchant,
        rule.category,
        rule.tag,
        rule.comment,
        rule.reimbursable,
        rule.billable,
        rule.report,
        rule.createReport,
        rule.tax?.field_id_TAX?.externalID,
    ]
        .filter(Boolean)
        .join('|');
    return `${StringUtils.hash(stableKey)}`;
}

export {formatExpenseRuleChanges, extractRuleFromForm, getKeyForRule};
