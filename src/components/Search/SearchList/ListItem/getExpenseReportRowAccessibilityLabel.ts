import {convertToDisplayString} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import type {ExpenseReportListItemType} from './types';

/**
 * Builds the screen-reader name for an expense report row. The row is a single accessibility element, so this combined
 * label (name, status, amount) is the only text announced for it. While the report's transactions are still scanning the
 * total is unknown, so we announce the same scanning text the row displays instead of a misleading $0.00.
 */
function getExpenseReportRowAccessibilityLabel(
    item: Pick<ExpenseReportListItemType, 'reportName' | 'formattedStatus' | 'totalDisplaySpend' | 'currency' | 'isAllScanning'>,
    scanningText: string,
): string {
    const amount = item.isAllScanning ? scanningText : convertToDisplayString(item.totalDisplaySpend ?? 0, item.currency ?? CONST.CURRENCY.USD);
    return [item.reportName, item.formattedStatus, amount].filter(Boolean).join(', ');
}

export default getExpenseReportRowAccessibilityLabel;
