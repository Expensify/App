import {useMemo} from 'react';
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
    allTransactions: Record<string, Transaction> | undefined,
    allPolicies: Record<string, unknown> | undefined,
    allReportActions: Record<string, Record<string, unknown>> | undefined,
    allReportNameValuePairs: Record<string, unknown> | undefined,
    personalDetails: Record<string, unknown> | undefined,
    transactionViolations: Record<string, unknown[]> | undefined,
): TodoSearchResultsData {
    const data: Record<string, unknown> = {};

    // Add reports
    for (const report of reports) {
        if (!report?.reportID) {
            continue;
        }
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;

        // Add the policy for this report
        if (report.policyID && allPolicies) {
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`;
            if (allPolicies[policyKey] && !data[policyKey]) {
                data[policyKey] = allPolicies[policyKey];
            }
        }

        // Add report name value pairs
        if (report.chatReportID && allReportNameValuePairs) {
            const nvpKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`;
            if (allReportNameValuePairs[nvpKey] && !data[nvpKey]) {
                data[nvpKey] = allReportNameValuePairs[nvpKey];
            }
        }

        // Add report actions
        if (allReportActions) {
            const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`;
            if (allReportActions[actionsKey] && !data[actionsKey]) {
                data[actionsKey] = allReportActions[actionsKey];
            }
        }
    }

    // Add transactions for these reports
    if (allTransactions) {
        const reportIDs = new Set(reports.map((r) => r.reportID));
        for (const [transactionKey, transaction] of Object.entries(allTransactions)) {
            if (transaction?.reportID && reportIDs.has(transaction.reportID)) {
                data[transactionKey] = transaction;

                // Add transaction violations
                if (transactionViolations) {
                    const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`;
                    if (transactionViolations[violationsKey]) {
                        data[violationsKey] = transactionViolations[violationsKey];
                    }
                }
            }
        }
    }

    // Add personal details
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

        const reports = allReports ? Object.values(allReports) : [];
        if (reports.length === 0) {
            return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
        }

        const transactionsByReportID: Record<string, Transaction[]> = {};
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

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }, [allReports, allTransactions, allPolicies, allReportNameValuePairs, allReportActions, accountID, login, bankAccountList]);

    const {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport} = todos;

    // Build SearchResults-formatted data for each to-do category
    const todoSearchResultsData = useMemo(() => {
        const buildData = (reports: Report[]): TodoSearchResultsData | undefined => {
            if (reports.length === 0) {
                return undefined;
            }
            return buildSearchResultsData(
                reports,
                allTransactions as Record<string, Transaction> | undefined,
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
    }, [reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport, allTransactions, allPolicies, allReportActions, allReportNameValuePairs, personalDetailsList, allTransactionViolations]);

    return {
        ...todos,
        todoSearchResultsData,
    };
}
