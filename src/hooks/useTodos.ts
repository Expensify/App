import {useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import {isApproveAction, isExportAction, isPrimaryPayAction, isSubmitAction} from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

type TodosResult = {
    reportsToSubmit: Report[];
    reportsToApprove: Report[];
    reportsToPay: Report[];
    reportsToExport: Report[];
};

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

/**
 * Hook that provides to-do data (reports needing action) and optionally builds it in SearchResults format.
 *
 * When the user is viewing a to-do search result, this hook provides live Onyx data in the same format
 * as the search snapshot, allowing the UI to display real-time updates instead of stale snapshot data.
 */
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

    // Get search context to determine if we're viewing a to-do search
    const {currentSearchKey, currentSearchResults} = useSearchContext();

    // Determine if the current search is a to-do action search based on the search key
    const isTodoSearch =
        currentSearchKey === CONST.SEARCH.SEARCH_KEYS.SUBMIT ||
        currentSearchKey === CONST.SEARCH.SEARCH_KEYS.APPROVE ||
        currentSearchKey === CONST.SEARCH.SEARCH_KEYS.PAY ||
        currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPORT;

    // Compute the categorized to-do reports
    const todos = useMemo((): TodosResult => {
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

    // Build SearchResults-formatted data for the current to-do search key
    const todoSearchResultsData = useMemo((): TodoSearchResultsData | undefined => {
        if (!isTodoSearch) {
            return undefined;
        }

        let relevantReports: Report[] = [];
        switch (currentSearchKey) {
            case CONST.SEARCH.SEARCH_KEYS.SUBMIT:
                relevantReports = reportsToSubmit;
                break;
            case CONST.SEARCH.SEARCH_KEYS.APPROVE:
                relevantReports = reportsToApprove;
                break;
            case CONST.SEARCH.SEARCH_KEYS.PAY:
                relevantReports = reportsToPay;
                break;
            case CONST.SEARCH.SEARCH_KEYS.EXPORT:
                relevantReports = reportsToExport;
                break;
            default:
                return undefined;
        }

        return buildSearchResultsData(
            relevantReports,
            allTransactions as Record<string, Transaction> | undefined,
            allPolicies as Record<string, unknown> | undefined,
            allReportActions as Record<string, Record<string, unknown>> | undefined,
            allReportNameValuePairs as Record<string, unknown> | undefined,
            personalDetailsList as Record<string, unknown> | undefined,
            allTransactionViolations as Record<string, unknown[]> | undefined,
        );
    }, [
        isTodoSearch,
        currentSearchKey,
        reportsToSubmit,
        reportsToApprove,
        reportsToPay,
        reportsToExport,
        allTransactions,
        allPolicies,
        allReportActions,
        allReportNameValuePairs,
        personalDetailsList,
        allTransactionViolations,
    ]);

    // Default search info when building from live data
    const defaultSearchInfo: SearchResultsInfo = useMemo(
        () => ({
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
        }),
        [],
    );

    // Return either the live to-do data or the snapshot data
    const searchResultsData = useMemo((): SearchResults | undefined => {
        // If viewing a to-do search and we have live data, use it
        if (isTodoSearch && todoSearchResultsData) {
            // Merge with snapshot search metadata but use live data
            const searchInfo: SearchResultsInfo = (currentSearchResults as SearchResults | undefined)?.search ?? defaultSearchInfo;
            return {
                search: searchInfo,
                data: todoSearchResultsData,
            };
        }

        // Otherwise return the snapshot data
        return (currentSearchResults as SearchResults | undefined) ?? undefined;
    }, [isTodoSearch, todoSearchResultsData, currentSearchResults, defaultSearchInfo]);

    return {
        ...todos,
        isTodoSearch,
        currentSearchKey,
        searchResultsData,
    };
}
