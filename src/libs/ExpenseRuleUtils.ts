import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule} from '@src/types/onyx';
import {getCleanedTagName} from './PolicyUtils';

function formatExpenseRuleChanges(rule: ExpenseRule, translate: LocaleContextProps['translate']): string {
    const changes: string[] = [];

    if (rule.billable) {
        changes.push(translate('expenseRulesPage.changes.billable', rule.billable === 'true'));
    }
    if (rule.category) {
        changes.push(translate('expenseRulesPage.changes.category', rule.category));
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

function extractRuleFromForm(form: ExpenseRuleForm) {
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
        // tax: form.tax,
    };
    return rule;
}

export {formatExpenseRuleChanges, extractRuleFromForm};
