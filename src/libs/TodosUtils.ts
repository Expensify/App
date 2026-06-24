import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from './ReportPrimaryActionUtils';
import {hasOnlyHeldExpenses, hasOnlyNonReimbursableTransactions} from './ReportUtils';

type CreateTodosReportsAndTransactionsParams = {
    allReports: OnyxCollection<Report>;
    allTransactions: OnyxCollection<Transaction>;
    allPolicies: OnyxCollection<Policy>;
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    allReportActions: OnyxCollection<ReportActions>;
    allReportMetadata: OnyxCollection<ReportMetadata>;
    bankAccountList: OnyxEntry<BankAccountList>;
    currentUserAccountID: number;
    login: string;
};

/**
 * Classifies every expense report into the four to-do buckets (submit/approve/pay/export) and indexes
 * transactions by report ID. Shared by the TODOS derived value and the on-demand to-do hooks.
 */
function createTodosReportsAndTransactions({
    allReports,
    allTransactions,
    allPolicies,
    allReportNameValuePairs,
    allReportActions,
    allReportMetadata,
    bankAccountList,
    currentUserAccountID,
    login,
}: CreateTodosReportsAndTransactionsParams) {
    const reportsToSubmit: Report[] = [];
    const reportsToApprove: Report[] = [];
    const reportsToPay: Report[] = [];
    const reportsToExport: Report[] = [];
    const transactionsByReportID: Record<string, Transaction[]> = {};

    const reports = Object.values(allReports ?? {});
    if (reports.length === 0) {
        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
    }

    if (allTransactions) {
        for (const transaction of Object.values(allTransactions)) {
            if (!transaction?.reportID) {
                continue;
            }
            (transactionsByReportID[transaction.reportID] ??= []).push(transaction);
        }
    }

    for (const report of reports) {
        if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
            continue;
        }
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
        const reportNameValuePair = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`];
        const reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`] ?? []);
        const reportTransactions = transactionsByReportID[report.reportID] ?? [];
        const reportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`];
        const allExpensesHeld = hasOnlyHeldExpenses(reportTransactions);
        if (isSubmitAction(report, reportTransactions, reportMetadata, policy, reportNameValuePair, undefined, login, currentUserAccountID) && !allExpensesHeld) {
            reportsToSubmit.push(report);
        }
        if (isApproveAction(report, reportTransactions, currentUserAccountID, reportMetadata, policy) && !allExpensesHeld) {
            reportsToApprove.push(report);
        }
        if (
            isPrimaryPayAction({
                report,
                reportTransactions,
                currentUserAccountID,
                currentUserLogin: login,
                bankAccountList,
                policy,
                reportNameValuePairs: reportNameValuePair,
            }) &&
            !hasOnlyNonReimbursableTransactions(report.reportID, reportTransactions) &&
            !allExpensesHeld
        ) {
            reportsToPay.push(report);
        }
        if (isExportAction(report, login, policy, reportActions) && policy?.exporter === login) {
            reportsToExport.push(report);
        }
    }

    return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
}

export default createTodosReportsAndTransactions;
export type {CreateTodosReportsAndTransactionsParams};
