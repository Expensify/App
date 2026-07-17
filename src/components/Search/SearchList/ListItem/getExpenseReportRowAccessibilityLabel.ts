import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type {ExpenseReportListItemType} from './types';

import getExpenseReportRowDisplayValues from './getExpenseReportRowDisplayValues';

type ExpenseReportRowAccessibilityItem = Pick<
    ExpenseReportListItemType,
    'formattedFrom' | 'reportName' | 'formattedStatus' | 'totalDisplaySpend' | 'currency' | 'isAllScanning' | 'created' | 'transactions' | 'transactionCount'
>;

type ExpenseReportRowAccessibilityLabelDeps = {
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

/**
 * Screen-reader name for an expense report row. The row is a single accessibility element, so this label is its whole
 * announcement and must mirror the visible cells.
 */
function getExpenseReportRowAccessibilityLabel(item: ExpenseReportRowAccessibilityItem, {translate, convertToDisplayString}: ExpenseReportRowAccessibilityLabelDeps): string {
    const {amount, date, expenseCountText} = getExpenseReportRowDisplayValues(item, {translate, convertToDisplayString});
    return [item.formattedFrom, item.reportName, item.formattedStatus, amount, date, expenseCountText].filter(Boolean).join(', ');
}

export default getExpenseReportRowAccessibilityLabel;
