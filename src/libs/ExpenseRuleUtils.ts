import type {LocaleContextProps} from '@components/LocaleContextProvider';
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

// eslint-disable-next-line import/prefer-default-export
export {formatExpenseRuleChanges};
