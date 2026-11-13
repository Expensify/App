import type {SearchColumnType, TableColumnSize} from '@components/Search/types';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useStableArrayReference from '@hooks/useStableArrayReference';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getReportDetailsColumns, {getConfiguredReportDetailsColumns} from '@libs/getReportDetailsColumns';
import {hasVendorFeature} from '@libs/PolicyUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {getTableMinWidth, isTransactionAmountTooLong, isTransactionTaxAmountTooLong} from '@libs/SearchUIUtils';
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

    /** True when opened from an IOU report, which hides column customization */
    isExpenseReportViewFromIOUReport: boolean;
};

function hasVisibleComments(reportActions: readonly OnyxTypes.ReportAction[]): boolean {
    return Object.values(reportActions ?? {}).some((action) => (action?.childVisibleActionCount ?? 0) > 0);
}

/**
 * Derives which columns the transaction table shows and how wide they are, from the report's
 * transactions and the user's saved column preferences.
 */
function useMoneyRequestReportColumns({report, policy, transactions, reportActions}: UseMoneyRequestReportColumnsParams): UseMoneyRequestReportColumnsResult {
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const {isBetaEnabled} = usePermissions();

    // Always use default columns for money request report view (don't use user-customized search columns)
    const isExpenseReportViewFromIOUReport = isIOUReport(report);
    const shouldShowCommentsColumn = hasVisibleComments(reportActions);
    // The saved column list is account-wide, so the vendor column only shows on reports whose workspace has the vendor feature.
    const isVendorColumnAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const columnsToShow = useStableArrayReference(
        getReportDetailsColumns({
            report,
            policy,
            transactions,
            columns: getConfiguredReportDetailsColumns(reportDetailsColumns, isVendorColumnAvailable),
            shouldShowCommentsColumn,
            isVendorColumnAvailable,
        }),
    );

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
