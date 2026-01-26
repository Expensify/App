import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, TaxRate} from '@src/types/onyx';
import {getDecodedCategoryName} from './CategoryUtils';
import {getCleanedTagName} from './PolicyUtils';
import StringUtils from './StringUtils';

function formatExpenseRuleChanges(rule: ExpenseRule, translate: LocaleContextProps['translate']): string {
    const changes: string[] = [];

    if (rule.billable) {
        changes.push(translate('expenseRulesPage.changes.billable', rule.billable === 'true'));
    }
    if (rule.category) {
        changes.push(translate('expenseRulesPage.changes.category', getDecodedCategoryName(rule.category)));
    }
    if (rule.comment) {
        changes.push(translate('expenseRulesPage.changes.comment', rule.comment));
    }
    if (rule.merchant) {
        changes.push(translate('expenseRulesPage.changes.merchant', rule.merchant));
    }
    if (rule.reimbursable) {
        changes.push(translate('expenseRulesPage.changes.reimbursable', rule.reimbursable === 'true'));
    }
    if (rule.report) {
        changes.push(translate('expenseRulesPage.changes.report', rule.report));
    }
    if (rule.tag) {
        changes.push(translate('expenseRulesPage.changes.tag', getCleanedTagName(rule.tag)));
    }
    if (rule.tax?.field_id_TAX) {
        changes.push(translate('expenseRulesPage.changes.tax', rule.tax.field_id_TAX.value));
    }

    return changes.join(', ');
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
