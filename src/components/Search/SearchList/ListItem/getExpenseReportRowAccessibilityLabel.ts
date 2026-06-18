import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {ExpenseReportListItemType} from './types';

type ExpenseReportRowAccessibilityItem = Pick<
    ExpenseReportListItemType,
    'formattedFrom' | 'reportName' | 'formattedStatus' | 'totalDisplaySpend' | 'currency' | 'isAllScanning' | 'created' | 'transactions' | 'transactionCount'
>;

/**
 * Screen-reader name for an expense report row. The row is a single accessibility element, so this label is its whole
 * announcement and must mirror the visible cells.
 */
function getExpenseReportRowAccessibilityLabel(item: ExpenseReportRowAccessibilityItem, translate: LocaleContextProps['translate']): string {
    const amount = item.isAllScanning ? translate('iou.receiptStatusTitle') : convertToDisplayString(item.totalDisplaySpend ?? 0, item.currency ?? CONST.CURRENCY.USD);

    const date = item.created
        ? DateUtils.formatWithUTCTimeZone(item.created, DateUtils.doesDateBelongToAPastYear(item.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT)
        : '';

    const filteredTransactions = item.transactions?.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const expenseCount = (filteredTransactions?.length ? filteredTransactions.length : undefined) ?? item.transactionCount ?? 0;
    const expenseCountText = translate('iou.expenseCount', {count: expenseCount});

    return [item.formattedFrom, item.reportName, item.formattedStatus, amount, date, expenseCountText].filter(Boolean).join(', ');
}

export default getExpenseReportRowAccessibilityLabel;
