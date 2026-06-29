import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, PersonalDetailsList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import {getLoginByAccountID} from './PersonalDetailsUtils';
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
    personalDetailsList: OnyxEntry<PersonalDetailsList>;
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

type TodoBucketContext = {
    policy: OnyxEntry<Policy>;
    reportNameValuePair: OnyxEntry<ReportNameValuePairs>;
    reportTransactions: Transaction[];
    reportMetadata: OnyxEntry<ReportMetadata>;
    allReportActions: OnyxCollection<ReportActions>;
    allExpensesHeld: boolean;
    ownerLogin: string | undefined;
    bankAccountList: OnyxEntry<BankAccountList>;
    currentUserAccountID: number;
    login: string;
};

/**
 * Single source of truth for whether a report belongs in a given to-do bucket. Both the all-buckets path
 * (`createTodosReportsAndTransactions`) and the single-bucket path (`getTodoReportsForSearchKey`) call this so
 * the classification rules can't drift between them.
 */
function reportMatchesTodoBucket(
    searchKey: SearchKey,
    report: Report,
    {policy, reportNameValuePair, reportTransactions, reportMetadata, allReportActions, allExpensesHeld, ownerLogin, bankAccountList, currentUserAccountID, login}: TodoBucketContext,
): boolean {
    switch (searchKey) {
        case CONST.SEARCH.SEARCH_KEYS.SUBMIT:
            return isSubmitAction(report, reportTransactions, reportMetadata, ownerLogin, policy, reportNameValuePair, undefined, login, currentUserAccountID) && !allExpensesHeld;
        case CONST.SEARCH.SEARCH_KEYS.APPROVE:
            return isApproveAction(report, reportTransactions, currentUserAccountID, reportMetadata, policy) && !allExpensesHeld;
        case CONST.SEARCH.SEARCH_KEYS.PAY:
            return (
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
            );
        case CONST.SEARCH.SEARCH_KEYS.EXPORT: {
            const reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`] ?? []);
            return isExportAction(report, login, policy, reportActions) && policy?.exporter === login;
        }
        default:
            return false;
    }
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
    personalDetailsList,
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
        const reportTransactions = transactionsByReportID[report.reportID] ?? [];
        const context: TodoBucketContext = {
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`],
            reportNameValuePair: allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`],
            reportTransactions,
            reportMetadata: allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`],
            allReportActions,
            allExpensesHeld: hasOnlyHeldExpenses(reportTransactions),
            ownerLogin: getLoginByAccountID(report.ownerAccountID, personalDetailsList),
            bankAccountList,
            currentUserAccountID,
            login,
        };
        if (reportMatchesTodoBucket(CONST.SEARCH.SEARCH_KEYS.SUBMIT, report, context)) {
            reportsToSubmit.push(report);
        }
        if (reportMatchesTodoBucket(CONST.SEARCH.SEARCH_KEYS.APPROVE, report, context)) {
            reportsToApprove.push(report);
        }
        if (reportMatchesTodoBucket(CONST.SEARCH.SEARCH_KEYS.PAY, report, context)) {
            reportsToPay.push(report);
        }
        if (reportMatchesTodoBucket(CONST.SEARCH.SEARCH_KEYS.EXPORT, report, context)) {
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
        personalDetailsList,
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
        const reportTransactions = transactionsByReportID[report.reportID] ?? [];
        const context: TodoBucketContext = {
            policy: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`],
            reportNameValuePair: allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`],
            reportTransactions,
            reportMetadata: allReportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`],
            allReportActions,
            allExpensesHeld: hasOnlyHeldExpenses(reportTransactions),
            ownerLogin: getLoginByAccountID(report.ownerAccountID, personalDetailsList),
            bankAccountList,
            currentUserAccountID,
            login,
        };

        if (reportMatchesTodoBucket(searchKey, report, context)) {
            reports.push(report);
        }
    }

    return {reports, transactionsByReportID};
}

export default createTodosReportsAndTransactions;
export {buildTransactionsByReportID, getTodoReportsForSearchKey};
