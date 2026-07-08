import type {SearchKey} from '@libs/SearchUIUtils';
import {getTodoReportsForSearchKey} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportActions, ReportNameValuePairs, SearchResults, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {shallowEqual} from 'fast-equals';
import {useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

type TodoSearchResultsData = SearchResults['data'];

type TodoMetadata = {
    /** Total number of transactions across all reports */
    count: number;
    /** Sum of all report totals (in cents) */
    total: number;
    /** Currency of the first report, used as reference currency */
    currency: string | undefined;
};

function computeMetadata(reports: Report[], transactionsByReportID: Record<string, Transaction[]>): TodoMetadata {
    let count = 0;
    let total = 0;
    let currency: string | undefined;

    for (const report of reports) {
        if (!report?.reportID) {
            continue;
        }

        const reportTransactions = transactionsByReportID[report.reportID];
        if (reportTransactions) {
            count += reportTransactions.length;

            for (const transaction of reportTransactions) {
                if (transaction.groupAmount) {
                    total -= transaction.groupAmount;
                }

                if (currency === undefined && transaction.groupCurrency) {
                    currency = transaction.groupCurrency;
                }
            }
        }
    }

    return {count, total, currency};
}

/**
 * Builds a SearchResults-compatible data object from the given reports and related data.
 * This allows the search UI to use live Onyx data instead of snapshot data when viewing to-do results.
 */
function buildSearchResultsData(
    reports: Report[],
    transactionsByReportID: Record<string, Transaction[]>,
    allPolicies: OnyxCollection<Policy>,
    allReportActions: OnyxCollection<ReportActions>,
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    transactionViolations: OnyxCollection<TransactionViolations>,
): TodoSearchResultsData {
    const data: TodoSearchResultsData = {};

    for (const report of reports) {
        if (!report?.reportID) {
            continue;
        }
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;

        if (report.policyID && allPolicies) {
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}` as const;
            if (allPolicies[policyKey] && !data[policyKey]) {
                data[policyKey] = allPolicies[policyKey];
            }
        }

        // Add the report name value pairs for the chat report (needed for pay eligibility checks)
        // Note: We don't add the chat report itself to match API behavior and avoid affecting shouldShowYear calculations
        if (report.chatReportID && allReportNameValuePairs) {
            const nvpKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}` as const;
            if (allReportNameValuePairs[nvpKey] && !data[nvpKey]) {
                data[nvpKey] = allReportNameValuePairs[nvpKey];
            }
        }

        if (allReportActions) {
            const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}` as const;
            if (allReportActions[actionsKey] && !data[actionsKey]) {
                data[actionsKey] = allReportActions[actionsKey];
            }
        }

        // Add transactions for this report using the pre-computed mapping
        const reportTransactions = transactionsByReportID[report.reportID];
        if (reportTransactions) {
            for (const transaction of reportTransactions) {
                const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}` as const;
                data[transactionKey] = transaction;

                if (transactionViolations) {
                    const violationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}` as const;
                    if (transactionViolations[violationsKey]) {
                        data[violationsKey] = transactionViolations[violationsKey];
                    }
                }
            }
        }
    }

    // Only attach personal details once we have at least one matching report. Otherwise an empty bucket would still
    // produce a non-empty `data` object, which SearchResultsProvider reads as "has results" and shows the wrong
    // empty state.
    if (personalDetails && reports.length > 0) {
        // PersonalDetailsList allows null values whereas the snapshot type does not; merge via Object.assign to keep
        // the live data faithful (including any null entries) without an unsafe narrowing assertion.
        Object.assign(data, {[ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails});
    }

    return data;
}

/**
 * Builds live SearchResults-shaped data and metadata for a single to-do search (submit/approve/pay/export).
 * Returns `undefined` (and skips all classification work) when `searchKey` is not provided, so the app-wide
 * SearchResultsProvider only does work while a to-do search is actually being viewed.
 */
function useTodoSearchResults(searchKey: SearchKey | undefined): {data: TodoSearchResultsData; metadata: TodoMetadata} | undefined {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [stableData, setStableData] = useState<TodoSearchResultsData | undefined>(undefined);

    if (!searchKey) {
        return undefined;
    }

    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const login = personalDetailsList?.[userAccountID]?.login ?? session?.email ?? '';

    const {reports, transactionsByReportID} = getTodoReportsForSearchKey(searchKey, {
        allReports,
        allTransactions,
        allPolicies,
        allReportNameValuePairs,
        allReportActions,
        allReportMetadata,
        personalDetailsList,
        bankAccountList,
        currentUserAccountID: userAccountID,
        login,
    });

    const metadata = computeMetadata(reports, transactionsByReportID);
    const data = buildSearchResultsData(reports, transactionsByReportID, allPolicies, allReportActions, allReportNameValuePairs, personalDetailsList, allTransactionViolations);

    // Preserve the previous `data` reference when its contents are unchanged (same key set and referentially-equal
    // entries) so unrelated Onyx collection writes don't churn the reference and force downstream section pipelines
    // to recompute. The entries are individual Onyx values that stay reference-stable across unrelated writes.
    let dataToReturn = data;
    if (stableData && shallowEqual(stableData, data)) {
        dataToReturn = stableData;
    } else if (data !== stableData) {
        setStableData(data);
    }

    return {data: dataToReturn, metadata};
}

export default useTodoSearchResults;
