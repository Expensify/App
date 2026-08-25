import type {SearchColumnType, SearchCustomColumnIds, TableColumnSize} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import {isPolicyTaxEnabled} from '@libs/PolicyUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {getColumnsToShow, getTableMinWidth, isTransactionAmountTooLong, isTransactionTaxAmountTooLong} from '@libs/SearchUIUtils';
import {hasNonReimbursableTransactions} from '@libs/TransactionUtils';
import shouldShowTransactionPostedYear from '@libs/TransactionUtils/shouldShowTransactionPostedYear';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StableReport} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

type UseMoneyRequestReportColumnsParams = {
    /** The money request report containing the transactions */
    report: StableReport;

    /** The workspace to which the report belongs */
    policy: OnyxTypes.Policy | undefined;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** Report actions of the report, used to decide whether the comments column shows */
    reportActions: OnyxTypes.ReportAction[];
};

type UseMoneyRequestReportColumnsResult = {
    /** The columns the table renders, in order */
    columnsToShow: SearchColumnType[];

    /** Width bucket of the date column */
    dateColumnSize: TableColumnSize;

    /** Width bucket of the posted-date column */
    postedColumnSize: TableColumnSize;

    /** Width bucket of the amount column */
    amountColumnSize: TableColumnSize;

    /** Width bucket of the tax-amount column */
    taxAmountColumnSize: TableColumnSize;

    /** Pixel width of the table at full column visibility */
    minTableWidth: number;

    /** True when the rendered table is wider than the viewport and needs its own horizontal scroller */
    shouldScrollHorizontally: boolean;

    /** Whether this expense-report view was opened from an IOU report — hides column customization */
    isExpenseReportViewFromIOUReport: boolean;
};

/**
 * Derives which columns the transaction table shows and how wide they are, from the report's
 * transactions and the user's saved column preferences.
 */
function useMoneyRequestReportColumns({report, policy, transactions, reportActions}: UseMoneyRequestReportColumnsParams): UseMoneyRequestReportColumnsResult {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();

    // Always use default columns for money request report view (don't use user-customized search columns)
    const isExpenseReportViewFromIOUReport = isIOUReport(report);
    const shouldShowBillableColumn = isBillableEnabledOnPolicy(policy);
    const shouldShowCommentsColumn = Object.values(reportActions ?? {}).some((action) => (action?.childVisibleActionCount ?? 0) > 0);
    const columnsToShow = getColumnsToShow({
        currentAccountID: currentUserDetails?.accountID,
        data: transactions,
        report,
        visibleColumns: (isExpenseReportViewFromIOUReport ? [] : (reportDetailsColumns ?? [])) as SearchCustomColumnIds[],
        isExpenseReportView: true,
        isExpenseReportViewFromIOUReport,
        shouldShowBillableColumn,
        shouldShowCommentsColumn,
        shouldShowReimbursableColumn: hasNonReimbursableTransactions(transactions),
        reportCurrency: report?.currency,
        isPolicyTaxEnabled: isPolicyTaxEnabled(policy),
    });

    const isAmountColumnWide = transactions.some((transaction) => isTransactionAmountTooLong(transaction));
    const isTaxAmountColumnWide = transactions.some((transaction) => isTransactionTaxAmountTooLong(transaction));
    const shouldShowYearForSomeTransaction = transactions.some((transaction) => shouldShowTransactionYear(transaction));
    const shouldShowPostedYearForSomeTransaction = transactions.some((transaction) => shouldShowTransactionPostedYear(transaction));

    const minTableWidth = getTableMinWidth(columnsToShow);
    const shouldScrollHorizontally = !shouldUseNarrowLayout && minTableWidth > windowWidth;

    return {
        columnsToShow,
        dateColumnSize: shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        postedColumnSize: shouldShowPostedYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        amountColumnSize: isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        taxAmountColumnSize: isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        minTableWidth,
        shouldScrollHorizontally,
        isExpenseReportViewFromIOUReport,
    };
}

export default useMoneyRequestReportColumns;
