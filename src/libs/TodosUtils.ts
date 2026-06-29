import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from './ReportPrimaryActionUtils';
import {hasOnlyHeldExpenses, hasOnlyNonReimbursableTransactions} from './ReportUtils';
import type {SearchKey} from './SearchUIUtils';

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
 * Buckets every transaction by its report ID. Shared by every to-do consumer that needs per-report transactions.
 */
function buildTransactionsByReportID(allTransactions: OnyxCollection<Transaction>): Record<string, Transaction[]> {
    const transactionsByReportID: Record<string, Transaction[]> = {};
    if (!allTransactions) {
        return transactionsByReportID;
    }
    for (const transaction of Object.values(allTransactions)) {
        if (!transaction?.reportID) {
            continue;
        }
        (transactionsByReportID[transaction.reportID] ??= []).push(transaction);
    }
    return transactionsByReportID;
}

/**
 * Classifies every expense report into the four to-do buckets (submit/approve/pay/export) and indexes
 * transactions by report ID. Used by the TODOS derived value and the on-demand to-do count hook.
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

    Object.assign(transactionsByReportID, buildTransactionsByReportID(allTransactions));

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

/**
 * Classifies expense reports for a single to-do bucket only, running just that bucket's predicate.
 * Used by the live search results path so viewing one to-do search doesn't compute the other buckets.
 */
function getTodoReportsForSearchKey(
    searchKey: SearchKey,
    {
        allReports,
        allTransactions,
        allPolicies,
        allReportNameValuePairs,
        allReportActions,
        allReportMetadata,
        bankAccountList,
        currentUserAccountID,
        login,
    }: CreateTodosReportsAndTransactionsParams,
) {
    const reports: Report[] = [];
    const transactionsByReportID = buildTransactionsByReportID(allTransactions);

    for (const report of Object.values(allReports ?? {})) {
        if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
            continue;
        }
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
        const reportNameValuePair = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`];
        const reportTransactions = transactionsByReportID[report.reportID] ?? [];
        const reportMetadata = allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`];
        const allExpensesHeld = hasOnlyHeldExpenses(reportTransactions);

        let matches = false;
        switch (searchKey) {
            case CONST.SEARCH.SEARCH_KEYS.SUBMIT:
                matches = isSubmitAction(report, reportTransactions, reportMetadata, policy, reportNameValuePair, undefined, login, currentUserAccountID) && !allExpensesHeld;
                break;
            case CONST.SEARCH.SEARCH_KEYS.APPROVE:
                matches = isApproveAction(report, reportTransactions, currentUserAccountID, reportMetadata, policy) && !allExpensesHeld;
                break;
            case CONST.SEARCH.SEARCH_KEYS.PAY:
                matches =
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
                    !allExpensesHeld;
                break;
            case CONST.SEARCH.SEARCH_KEYS.EXPORT: {
                const reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`] ?? []);
                matches = isExportAction(report, login, policy, reportActions) && policy?.exporter === login;
                break;
            }
            default:
                matches = false;
        }

        if (matches) {
            reports.push(report);
        }
    }

    return {reports, transactionsByReportID};
}

export default createTodosReportsAndTransactions;
export {buildTransactionsByReportID, getTodoReportsForSearchKey};
