import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, PersonalDetailsList, Policy, Report, ReportActions, ReportMetadata, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {SearchKey} from './SearchUIUtils';

import {getLoginByAccountID} from './PersonalDetailsUtils';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from './ReportPrimaryActionUtils';
import {hasOnlyHeldExpenses, hasOnlyNonReimbursableTransactions} from './ReportUtils';

type CreateTodosReportsAndTransactionsParams = {
    /** Every report, keyed by report Onyx key - iterated to find the expense reports that belong in a to-do bucket */
    allReports: OnyxCollection<Report>;

    /** Every transaction, keyed by transaction Onyx key - bucketed per report so each report's expenses are known */
    allTransactions: OnyxCollection<Transaction>;

    /** Every policy, keyed by policy Onyx key - a report's policy drives its submit/approve/pay/export eligibility */
    allPolicies: OnyxCollection<Policy>;

    /** Every report name-value pair, keyed by report Onyx key - looked up by `chatReportID` for the workflow checks */
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Every report's actions, keyed by report Onyx key - used by the export predicate to detect exported reports */
    allReportActions: OnyxCollection<ReportActions>;

    /** Every report's metadata, keyed by report Onyx key - feeds the submit/approve predicates */
    allReportMetadata: OnyxCollection<ReportMetadata>;

    /** All personal details - used to resolve a report owner's login from their account ID for the submit predicate */
    personalDetailsList: OnyxEntry<PersonalDetailsList>;

    /** The current user's bank accounts - the pay predicate needs them to know whether the user can pay */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** The current user's account ID - identifies which reports the user owns/manages */
    currentUserAccountID: number;

    /** The current user's primary login - matched against policy roles (e.g. exporter, reimburser) */
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
    /** The report's policy - drives every bucket's eligibility checks */
    policy: OnyxEntry<Policy>;

    /** The report's name-value pair (looked up by `chatReportID`) - feeds the submit/pay workflow checks */
    reportNameValuePair: OnyxEntry<ReportNameValuePairs>;

    /** The report's transactions - inspected for amount, reimbursability, and hold status */
    reportTransactions: Transaction[];

    /** The report's metadata - feeds the submit/approve predicates */
    reportMetadata: OnyxEntry<ReportMetadata>;

    /** Every report's actions - the export predicate reads the actions for this report from it */
    allReportActions: OnyxCollection<ReportActions>;

    /** Whether every transaction on the report is on hold - precomputed once so held reports are excluded from submit/approve/pay */
    allExpensesHeld: boolean;

    /** The report owner's login, resolved from `ownerAccountID` - the submit predicate matches it against the submitter */
    ownerLogin: string | undefined;

    /** The current user's bank accounts - the pay predicate needs them to know whether the user can pay */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** The current user's account ID - identifies whether the user owns/manages this report */
    currentUserAccountID: number;

    /** The current user's primary login - matched against policy roles (e.g. exporter, reimburser) */
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
