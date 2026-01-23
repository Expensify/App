import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, TaxRate} from '@src/types/onyx';
import {getDecodedCategoryName} from './CategoryUtils';
import {getCleanedTagName} from './PolicyUtils';
import StringUtils from './StringUtils';

function formatExpenseRuleChanges(rule: ExpenseRule, translate: LocaleContextProps['translate']): string {
    const changes: string[] = [];

    const addChange = (translationKey: TranslationPaths, value: string | boolean) => {
        const keyToUse = changes.length === 0 ? `${translationKey}Update` : translationKey;
        changes.push(translate(keyToUse as TranslationPaths, value as TranslationParameters<TranslationPaths>[0]));
    };

    if (rule.billable) {
        addChange('expenseRulesPage.changes.billable', rule.billable === 'true');
    }
    if (rule.category) {
        addChange('expenseRulesPage.changes.category', getDecodedCategoryName(rule.category));
    }
    if (rule.comment) {
        addChange('expenseRulesPage.changes.comment', rule.comment);
    }
    if (rule.merchant) {
        addChange('expenseRulesPage.changes.merchant', rule.merchant);
    }
    if (rule.reimbursable) {
        addChange('expenseRulesPage.changes.reimbursable', rule.reimbursable === 'true');
    }
    if (rule.tag) {
        addChange('expenseRulesPage.changes.tag', getCleanedTagName(rule.tag));
    }
    if (rule.tax?.field_id_TAX) {
        addChange('expenseRulesPage.changes.tax', rule.tax.field_id_TAX.value);
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
