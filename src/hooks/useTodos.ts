import {useMemo} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid using snapshots for live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

type TodoSearchResultsData = SearchResults['data'];

/**
 * Builds a SearchResults-compatible data object from the given reports and related data.
 * This allows the search UI to use live Onyx data instead of snapshot data when viewing to-do results.
 */
function buildSearchResultsData(
    reports: Report[],
    transactionsByReportID: Record<string, Transaction[]>,
    allPolicies: Record<string, unknown> | undefined,
    allReportActions: Record<string, Record<string, unknown>> | undefined,
    allReportNameValuePairs: Record<string, unknown> | undefined,
    personalDetails: Record<string, unknown> | undefined,
    transactionViolations: Record<string, unknown[]> | undefined,
): TodoSearchResultsData {
    const data: Record<string, unknown> = {};

    for (const report of reports) {
        if (!report?.reportID) {
            continue;
        }
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;

        if (report.policyID && allPolicies) {
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`;
            if (allPolicies[policyKey] && !data[policyKey]) {
                data[policyKey] = allPolicies[policyKey];
            }
        }

        if (report.chatReportID && allReportNameValuePairs) {
            const nvpKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`;
            if (allReportNameValuePairs[nvpKey] && !data[nvpKey]) {
                data[nvpKey] = allReportNameValuePairs[nvpKey];
            }
        }

        if (allReportActions) {
            const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`;
            if (allReportActions[actionsKey] && !data[actionsKey]) {
                data[actionsKey] = allReportActions[actionsKey];
            }
        }

        // Add transactions for this report using the pre-computed mapping
        const reportTransactions = transactionsByReportID[report.reportID];
        if (reportTransactions) {
            for (const transaction of reportTransactions) {
                const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                data[transactionKey] = transaction;

                if (transactionViolations) {
                    const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`;
                    if (transactionViolations[violationsKey]) {
                        data[violationsKey] = transactionViolations[violationsKey];
                    }
                }
            }
        }
    }

    if (personalDetails) {
        data[ONYXKEYS.PERSONAL_DETAILS_LIST] = personalDetails;
    }

    return data as TodoSearchResultsData;
}

export default function useTodos() {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const {login = '', accountID} = useCurrentUserPersonalDetails();

    const todos = useMemo(() => {
        const reportsToSubmit: Report[] = [];
        const reportsToApprove: Report[] = [];
        const reportsToPay: Report[] = [];
        const reportsToExport: Report[] = [];
        const transactionsByReportID: Record<string, Transaction[]> = {};

        const reports = allReports ? Object.values(allReports) : [];
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

            if (isSubmitAction(report, reportTransactions, policy, reportNameValuePair)) {
                reportsToSubmit.push(report);
            }
            if (isApproveAction(report, reportTransactions, policy)) {
                reportsToApprove.push(report);
            }
            if (isPrimaryPayAction(report, accountID, login, bankAccountList, policy, reportNameValuePair)) {
                reportsToPay.push(report);
            }
            if (isExportAction(report, login, policy, reportActions)) {
                reportsToExport.push(report);
            }
        }

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID};
    }, [allReports, allTransactions, allPolicies, allReportNameValuePairs, allReportActions, accountID, login, bankAccountList]);

    const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, transactionsByReportID} = todos;

    // Build SearchResults-formatted data for each to-do category
    const todoSearchResultsData = useMemo(() => {
        const buildData = (reports: Report[]): TodoSearchResultsData => {
            if (reports.length === 0) {
                // Return empty object like the Search API would when there's no data
                return {} as TodoSearchResultsData;
            }
            return buildSearchResultsData(
                reports,
                transactionsByReportID,
                allPolicies as Record<string, unknown> | undefined,
                allReportActions as Record<string, Record<string, unknown>> | undefined,
                allReportNameValuePairs as Record<string, unknown> | undefined,
                personalDetailsList as Record<string, unknown> | undefined,
                allTransactionViolations as Record<string, unknown[]> | undefined,
            );
        };

        return {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: buildData(reportsToSubmit),
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: buildData(reportsToApprove),
            [CONST.SEARCH.SEARCH_KEYS.PAY]: buildData(reportsToPay),
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: buildData(reportsToExport),
        };
    }, [
        reportsToSubmit,
        reportsToApprove,
        reportsToPay,
        reportsToExport,
        transactionsByReportID,
        allPolicies,
        allReportActions,
        allReportNameValuePairs,
        personalDetailsList,
        allTransactionViolations,
    ]);

    return {
        reportsToSubmit,
        reportsToApprove,
        reportsToPay,
        reportsToExport,
        todoSearchResultsData,
    };
}
