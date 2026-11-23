/** Shares the report column preference and data-driven defaults across the table, picker and expense fields. */
import type {SearchCustomColumnIds} from '@components/Search/types';

import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import {isBillableEnabledOnPolicy} from './MoneyRequestReportUtils';
import {isPolicyTaxEnabled} from './PolicyUtils';
import {isIOUReport} from './ReportUtils';
import {getColumnsToShow, isReportDetailsCustomColumn} from './SearchUIUtils';
import {hasNonReimbursableTransactions} from './TransactionUtils';

type GetReportDetailsColumnsParams = {
    report: Report | undefined;
    policy: Policy | undefined;
    transactions: Transaction[];
    columns?: SearchCustomColumnIds[];
    shouldShowCommentsColumn?: boolean;
    isVendorColumnAvailable?: boolean;
};

function getConfiguredReportDetailsColumns(columns: readonly string[] | undefined, isVendorColumnAvailable: boolean): SearchCustomColumnIds[] {
    const configuredColumns = (columns ?? []).filter(isReportDetailsCustomColumn);
    return isVendorColumnAvailable ? configuredColumns : configuredColumns.filter((column) => column !== CONST.SEARCH.TABLE_COLUMNS.VENDOR);
}

function getReportDetailsColumns({report, policy, transactions, columns, shouldShowCommentsColumn, isVendorColumnAvailable}: GetReportDetailsColumnsParams) {
    const isExpenseReportViewFromIOUReport = isIOUReport(report);
    return getColumnsToShow({
        currentAccountID: undefined,
        data: transactions,
        report,
        visibleColumns: isExpenseReportViewFromIOUReport ? [] : columns,
        isExpenseReportView: true,
        isExpenseReportViewFromIOUReport,
        shouldShowBillableColumn: isBillableEnabledOnPolicy(policy),
        shouldShowCommentsColumn,
        shouldShowReimbursableColumn: hasNonReimbursableTransactions(transactions),
        reportCurrency: report?.currency,
        isPolicyTaxEnabled: isPolicyTaxEnabled(policy),
        isVendorColumnAvailable,
    });
}

export default getReportDetailsColumns;
export {getConfiguredReportDetailsColumns};
