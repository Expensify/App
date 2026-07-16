import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {ExpenseReportListItemType, TransactionListItemType} from './types';

type ExpenseReportRowDisplayValuesDeps = {
    translate: LocaleContextProps['translate'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

// Only the fields this helper reads — keeps the API honest and makes it trivial to unit test.
type ExpenseReportRowDisplayItem = Pick<ExpenseReportListItemType, 'isAllScanning' | 'totalDisplaySpend' | 'currency' | 'transactionCount' | 'created'> & {
    transactions?: Array<Pick<TransactionListItemType, 'pendingAction'>>;
};

/**
 * Derives the values an expense-report row shows — scanning-aware amount, formatted date, expense-count text — so the
 * visible cells and the row's accessibility label share one source of truth and can't drift apart.
 */
function getExpenseReportRowDisplayValues(item: ExpenseReportRowDisplayItem, {translate, convertToDisplayString}: ExpenseReportRowDisplayValuesDeps) {
    const amount = item.isAllScanning ? translate('iou.receiptStatusTitle') : convertToDisplayString(item.totalDisplaySpend ?? 0, item.currency ?? CONST.CURRENCY.USD);

    const filteredTransactions = item.transactions?.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const expenseCount = (filteredTransactions?.length ? filteredTransactions.length : undefined) ?? item.transactionCount ?? 0;
    const expenseCountText = translate('iou.expenseCount', {count: expenseCount});

    const date = item.created
        ? DateUtils.formatWithUTCTimeZone(item.created, DateUtils.doesDateBelongToAPastYear(item.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT)
        : '';

    return {amount, expenseCountText, date};
}

export default getExpenseReportRowDisplayValues;
