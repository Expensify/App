import {convertToDisplayString} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import type {ExpenseReportListItemType} from './types';

/**
 * Builds the screen-reader name for an expense report row. The row is a single accessibility element, so this combined
 * label (name, status, amount) is the only text announced for it.
 */
function getExpenseReportRowAccessibilityLabel(item: Pick<ExpenseReportListItemType, 'reportName' | 'formattedStatus' | 'totalDisplaySpend' | 'currency'>): string {
    return [item.reportName, item.formattedStatus, convertToDisplayString(item.totalDisplaySpend ?? 0, item.currency ?? CONST.CURRENCY.USD)].filter(Boolean).join(', ');
}

export default getExpenseReportRowAccessibilityLabel;
