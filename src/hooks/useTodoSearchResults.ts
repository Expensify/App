import type {SearchFooterTotal} from '@components/Search/types';

import type {SearchKey} from '@libs/SearchKeyUtils';
import {doesTransactionMatchFooterTotal} from '@libs/SearchUIUtils';
import {getTodoReportsForSearchKey} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportActions, ReportNameValuePairs, SearchResults, Transaction, TransactionViolations} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

import {useAllPersonalDetailsWithoutSnapshots} from './usePersonalDetails';

type TodoSearchResultsData = SearchResults['data'];

type TodoMetadata = {
    /** Total number of transactions across all reports */
    count: number;
    /** Sum of all report totals (in cents) */
    total: number;
    /** Currency of the first report, used as reference currency */
    currency: string | undefined;
    /** The server's report count, minus the reports that have left the list since its response */
    reportCount?: number;
};

/**
 * The count and total the footer shows for a live to-do search. `footerTotal` is the breakdown the query asks for:
 * the total covers only the expenses that belong in it, while the count stays every expense the search matched,
 * which is how the backend answers a snapshot search.
 */
function computeMetadata(reports: Report[], transactionsByReportID: Record<string, Transaction[]>, footerTotal: SearchFooterTotal | undefined): TodoMetadata {
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
                if (transaction.groupAmount && doesTransactionMatchFooterTotal(transaction, footerTotal)) {
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

/** Report IDs, each mapped to true */
type ReportIDSet = Record<string, boolean>;

/** Counted reports this device has listed, per to-do list */
type SeenReportIDsBySearchKey = Partial<Record<SearchKey, ReportIDSet>>;

type TodoReportCountParams = {
    /** The server's figures for the search, from its snapshot */
    serverSearch: SearchResults['search'] | undefined;

    /** The to-do list as search data */
    liveData: TodoSearchResultsData;

    /** Whether every collection that decides which reports are to-dos has loaded */
    isLoaded: boolean;

    /** Counted reports this device has listed for the search */
    seenReportIDs: ReportIDSet;
};

/**
 * The server's report count, minus the counted reports this device listed that have since left the list. Reports it
 * never listed, such as one with a receipt still scanning, never count as left.
 */
function getTodoReportCount({serverSearch, liveData, isLoaded, seenReportIDs}: TodoReportCountParams): number | undefined {
    if (serverSearch?.reportCount === undefined) {
        return undefined;
    }

    // Until everything has loaded, reports that still match are missing from the list, so none counts as left.
    const countedReportIDs = isLoaded ? Object.keys(serverSearch.countedReportIDs ?? {}) : [];
    const departedReportCount = countedReportIDs.filter((reportID) => seenReportIDs[reportID] && !liveData[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]).length;
    return Math.max(serverSearch.reportCount - departedReportCount, 0);
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
 * Its report count is the server's from `serverSearch`, minus the reports that have left the list since.
 * Returns `undefined` (and skips all classification work) when `searchKey` is not provided, so the app-wide
 * SearchResultsProvider only does work while a to-do search is actually being viewed.
 */
function useTodoSearchResults(
    searchKey: SearchKey | undefined,
    footerTotal: SearchFooterTotal | undefined,
    serverSearch: SearchResults['search'] | undefined,
): {data: TodoSearchResultsData; metadata: TodoMetadata} | undefined {
    const [allReports, reportsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies, policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportNameValuePairs, reportNameValuePairsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [allTransactions, transactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReportActions, reportActionsResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportMetadata, reportMetadataResult] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [bankAccountList, bankAccountListResult] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION);
    const [personalDetailsList, personalDetailsResult] = useAllPersonalDetailsWithoutSnapshots();
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [rules, rulesResult] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [seenReportIDsBySearchKey, setSeenReportIDsBySearchKey] = useState<SeenReportIDsBySearchKey>({});

    if (!searchKey) {
        return undefined;
    }

    const userAccountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const login = personalDetailsList?.[userAccountID]?.login ?? session?.email ?? '';
    const areTransactionsLoaded = transactionsMetadata.status === 'loaded';
    // Every input of getTodoReportsForSearchKey must be listed here, or a report still loading counts as left.
    const isLoaded = !isLoadingOnyxValue(
        reportsResult,
        policiesResult,
        reportNameValuePairsResult,
        transactionsMetadata,
        reportActionsResult,
        reportMetadataResult,
        bankAccountListResult,
        sessionResult,
        personalDetailsResult,
        rulesResult,
    );

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
        areTransactionsLoaded,
        rules,
    });

    const data = buildSearchResultsData(reports, transactionsByReportID, allPolicies, allReportActions, allReportNameValuePairs, personalDetailsList, allTransactionViolations);
    const {count, total, currency} = computeMetadata(reports, transactionsByReportID, footerTotal);

    // A counted report can only leave the list after this device has listed it, so remember the ones it has, per to-do list.
    const seenReportIDs = seenReportIDsBySearchKey[searchKey] ?? {};
    const newlySeenReportIDs = isLoaded
        ? Object.keys(serverSearch?.countedReportIDs ?? {}).filter((reportID) => !seenReportIDs[reportID] && !!data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`])
        : [];
    if (newlySeenReportIDs.length > 0) {
        setSeenReportIDsBySearchKey({...seenReportIDsBySearchKey, [searchKey]: {...seenReportIDs, ...Object.fromEntries(newlySeenReportIDs.map((reportID) => [reportID, true]))}});
    }
    const reportCount = getTodoReportCount({serverSearch, liveData: data, isLoaded, seenReportIDs});

    return {data, metadata: {count, total, currency, reportCount}};
}

export default useTodoSearchResults;
export {getTodoReportCount};
