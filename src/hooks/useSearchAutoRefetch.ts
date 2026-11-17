import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {search} from '@libs/actions/Search';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {isReportActionEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MemberCustomFieldsByPolicyID} from '@src/selectors/Policy';
import type {ReportActions, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import useIsInPreloadedTab from './useIsInPreloadedTab';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useShouldReturnTripRooms from './useShouldReturnTripRooms';

type UseSearchAutoRefetch = {
    /** Current Search snapshot */
    searchResults: OnyxEntry<SearchResults>;

    /** Current transactions collection */
    transactions: OnyxCollection<Transaction>;

    /** Previous transactions collection, compared against `transactions` to detect newly-added ones */
    previousTransactions: OnyxCollection<Transaction>;

    /** Current report actions collection */
    reportActions: OnyxCollection<ReportActions>;

    /** Previous report actions collection, compared against `reportActions` to detect new entries */
    previousReportActions: OnyxCollection<ReportActions>;

    /** Member custom fields of the policies the results display, keyed by policy ID then member login */
    memberCustomFields: MemberCustomFieldsByPolicyID | undefined;

    /** Previous member custom fields, compared against `memberCustomFields` to detect edits */
    previousMemberCustomFields: MemberCustomFieldsByPolicyID | undefined;

    /** Parsed search query the refetch is issued for */
    queryJSON: SearchQueryJSON;

    /** Key identifying the current search */
    searchKey: SearchKey | undefined;

    /** Pagination offset for the refetch request */
    offset: number;

    /** Whether the refetch should recalculate result totals */
    shouldCalculateTotals: boolean;
};

/**
 * Triggers a search when a transaction or report action is added so the snapshot reflects it.
 * Returns the newly-added transactions, which the grouped views use to refetch each expanded group's child snapshot.
 */
function useSearchAutoRefetch({
    searchResults,
    transactions,
    previousTransactions,
    reportActions,
    previousReportActions,
    memberCustomFields,
    previousMemberCustomFields,
    queryJSON,
    searchKey,
    offset,
    shouldCalculateTotals,
}: UseSearchAutoRefetch) {
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const isInPreloadedTab = useIsInPreloadedTab();
    const searchTriggeredRef = useRef(false);
    const [transactionWrites] = useOnyx(ONYXKEYS.RAM_ONLY_SEARCH_TRANSACTION_WRITES);
    // A write from before this Search mounted is not refetched here, the same as any other change made while it was unmounted.
    const handledTransactionWriteIDRef = useRef(transactionWrites?.writeID);
    const hasPendingSearchRef = useRef(false);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;
    const shouldReturnTripRooms = useShouldReturnTripRooms(queryJSON.type);

    const searchResultsData = searchResults?.data;

    const prevTransactionsIDs = Object.keys(previousTransactions ?? {});
    const newTransactions: Transaction[] = [];
    if (prevTransactionsIDs.length > 0) {
        const previousIDs = new Set(prevTransactionsIDs);
        for (const [id, transaction] of Object.entries(transactions ?? {})) {
            if (!previousIDs.has(id) && transaction) {
                newTransactions.push(transaction);
            }
        }
    }

    useEffect(() => {
        // For live data, isLoading is always false, so we also need to reset when searchResultsData changes
        // For snapshot data, we wait for isLoading to become false after the API call completes
        // Declared before the refetch effect so it releases the latch first, and a write that arrived mid-request is handled in the same pass
        if (searchResults?.search?.isLoading) {
            return;
        }

        searchTriggeredRef.current = false;
    }, [searchResults?.search?.isLoading, searchResultsData]);

    // Trigger search when a new report action is added while on chat or when a new transaction is added for the other search types.
    useEffect(() => {
        // Trip rows don't change when transactions or report actions do
        if (shouldReturnTripRooms) {
            return;
        }

        // A preloaded tab refreshes its whole snapshot on first open, so a refetch deferred while hidden would only repeat it.
        if (isInPreloadedTab) {
            return;
        }

        const newTransactionWrite = transactionWrites && transactionWrites.writeID !== handledTransactionWriteIDRef.current ? transactionWrites : undefined;

        // Snapshot and focus updates re-run this effect with unchanged collections, which would diff a collection against itself.
        if (
            transactions === previousTransactions &&
            reportActions === previousReportActions &&
            memberCustomFields === previousMemberCustomFields &&
            !newTransactionWrite &&
            !hasPendingSearchRef.current
        ) {
            return;
        }

        const previousTransactionIDsLocal = Object.keys(previousTransactions ?? {});
        const transactionsIDs = Object.keys(transactions ?? {});

        // Only proceed if we have previous data to compare against
        // This prevents triggering on initial data load
        const hasPreviousReportActions = Object.values(previousReportActions ?? {}).some((actions) => Object.keys(actions ?? {}).length > 0);
        if ((previousTransactionIDsLocal.length === 0 && !hasPreviousReportActions) || searchTriggeredRef.current) {
            return;
        }

        // Only chat searches are driven by report actions, so the rest skip walking that collection entirely.
        const reportActionsIDs = isChat ? Object.values(reportActions ?? {}).flatMap((actions) => Object.keys(actions ?? {})) : [];
        const previousReportActionsIDs = isChat ? Object.values(previousReportActions ?? {}).flatMap((actions) => Object.keys(actions ?? {})) : [];

        const previousTransactionsIDsSet = new Set(previousTransactionIDsLocal);
        const previousReportActionsIDsSet = new Set(previousReportActionsIDs);
        const hasTransactionsIDsChange = transactionsIDs.length !== previousTransactionIDsLocal.length || transactionsIDs.some((id) => !previousTransactionsIDsSet.has(id));
        const hasReportActionsIDsChange = reportActionsIDs.some((id) => !previousReportActionsIDsSet.has(id));

        // Editing an expense changes no transaction ID, so the ID checks above miss it. The footer total, row actions
        // and filter membership are computed by the server, so a user write to a transaction the results depend on
        // needs a refetch. Reads that rewrite transactions, like OpenReport, never raise this signal.
        const hasWrittenResultTransaction = !isChat && !!newTransactionWrite && hasWrittenTransactionInSearchResults(newTransactionWrite.transactionIDs, transactions, searchResultsData);
        if (newTransactionWrite) {
            handledTransactionWriteIDRef.current = newTransactionWrite.writeID;
        }
        const hasChangedResultMemberCustomField = !isChat && hasChangedMemberCustomField(memberCustomFields, previousMemberCustomFields);

        // Check if there is a change in the transactions or report actions list
        if ((isChat ? hasReportActionsIDsChange : hasTransactionsIDsChange || hasWrittenResultTransaction || hasChangedResultMemberCustomField) || hasPendingSearchRef.current) {
            // Skip if offline, or if the user has navigated to a different fullscreen page entirely.
            // An RHP layered on top of Search makes `isFocused` false but keeps Search as the topmost
            // fullscreen route, so we still want to refetch — otherwise the snapshot can't reflect
            // entries the user creates from the RHP until they close it.
            const isSearchStillActive = isFocused || isSearchTopmostFullScreenRoute();
            if (!isSearchStillActive || isOffline) {
                hasPendingSearchRef.current = true;
                return;
            }
            // A deferred refetch is its own reason to search. `usePrevious` advances while Search is inactive, so by
            // the time it becomes active again the change that set the flag has washed out of the comparisons below.
            const hadPendingSearch = hasPendingSearchRef.current;
            hasPendingSearchRef.current = false;

            // Transaction Onyx keys are `transactions_<id>` but search results yield bare IDs, so read the ID off the value.
            const addedTransactionIDs: string[] = [];
            for (const [key, transaction] of Object.entries(transactions ?? {})) {
                const transactionID = transaction?.transactionID;
                if (!transactionID) {
                    continue;
                }
                if (!previousTransactionsIDsSet.has(key)) {
                    addedTransactionIDs.push(transactionID);
                }
            }

            let currentSearchResultIDs: string[] = [];
            if (searchResultsData) {
                currentSearchResultIDs = isChat ? extractReportActionIDsFromSearchResults(searchResultsData) : extractTransactionIDsFromSearchResults(searchResultsData);
            }
            const existingSearchResultIDsSet = new Set(currentSearchResultIDs);
            const hasAGenuinelyNewID = (isChat ? reportActionsIDs : addedTransactionIDs).some((id) => !existingSearchResultIDsSet.has(id));

            // Only skip search if there are no new items AND search results aren't empty
            // This ensures deletions that result in empty data still trigger search
            if (!hasAGenuinelyNewID && !hasWrittenResultTransaction && !hasChangedResultMemberCustomField && !hadPendingSearch && currentSearchResultIDs.length > 0) {
                // Most transaction rows were never loaded into Onyx, so a row missing from Onyx is not a deletion. Only a member that just left the collection is.
                const reportActionsIDsSet = new Set(reportActionsIDs);
                const hasDeletedID = isChat
                    ? currentSearchResultIDs.some((id) => !reportActionsIDsSet.has(id))
                    : Object.entries(previousTransactions ?? {}).some(
                          ([key, transaction]) => !transactions?.[key] && !!transaction?.transactionID && existingSearchResultIDsSet.has(transaction.transactionID),
                      );
                if (!hasDeletedID) {
                    return;
                }
            }

            // Trigger the search
            TransitionTracker.runAfterTransitions({
                callback: () => {
                    search({queryJSON, searchKey, offset, shouldCalculateTotals, isLoading: !!searchResults?.search?.isLoading});
                },
            });

            // Set the ref to prevent further triggers until reset
            searchTriggeredRef.current = true;
        }
    }, [
        isFocused,
        transactions,
        previousTransactions,
        queryJSON,
        searchKey,
        offset,
        shouldCalculateTotals,
        reportActions,
        previousReportActions,
        memberCustomFields,
        previousMemberCustomFields,
        isChat,
        searchResultsData,
        isOffline,
        searchResults?.search?.isLoading,
        shouldReturnTripRooms,
        isInPreloadedTab,
        transactionWrites,
    ]);

    return {newTransactions};
}

function getTransactionIDFromEntry(entry: unknown) {
    if (typeof entry !== 'object' || entry === null || !('transactionID' in entry) || typeof entry.transactionID !== 'string') {
        return undefined;
    }
    return entry.transactionID;
}

function hasNestedTransactions(entry: unknown): entry is {transactions: Array<Partial<TransactionListItemType>>} {
    if (typeof entry !== 'object' || entry === null || !('transactions' in entry)) {
        return false;
    }
    return Array.isArray(entry.transactions);
}

/**
 * Helper function to extract transaction IDs from search results data.
 */
function getPolicyIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']> | undefined): string[] {
    return Object.keys(searchResultsData ?? {})
        .filter((key) => key.startsWith(ONYXKEYS.COLLECTION.POLICY))
        .map((key) => key.slice(ONYXKEYS.COLLECTION.POLICY.length));
}

function extractTransactionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    const transactionIDs: string[] = [];

    for (const item of Object.values(searchResultsData)) {
        // Check for transactionID directly on the item (TransactionListItemType)
        const transactionID = getTransactionIDFromEntry(item);
        if (transactionID) {
            transactionIDs.push(transactionID);
        }

        // Check for transactions array within the item (TransactionGroupListItemType)
        if (!hasNestedTransactions(item)) {
            continue;
        }
        for (const transaction of item.transactions) {
            const nestedTransactionID = getTransactionIDFromEntry(transaction);
            if (!nestedTransactionID) {
                continue;
            }
            transactionIDs.push(nestedTransactionID);
        }
    }

    return transactionIDs;
}

/**
 * Helper function to extract report action IDs from search results data.
 */
function extractReportActionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    return Object.keys(searchResultsData ?? {})
        .filter(isReportActionEntry)
        .map((key) => Object.keys(searchResultsData[key] ?? {}))
        .flat();
}

/**
 * Whether a transaction a user write just changed affects the current results: it is on screen, or it now belongs
 * to a report on screen, whose row owes its count and total to the server.
 */
function hasWrittenTransactionInSearchResults(
    writtenTransactionIDs: string[],
    transactions: OnyxCollection<Transaction>,
    searchResultsData: Partial<SearchResults['data']> | undefined,
): boolean {
    if (!searchResultsData) {
        return false;
    }

    const searchResultIDs = new Set(extractTransactionIDsFromSearchResults(searchResultsData));
    return writtenTransactionIDs.some((transactionID) => {
        if (searchResultIDs.has(transactionID)) {
            return true;
        }
        const reportID = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID;
        return !!reportID && !!searchResultsData[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    });
}

function hasChangedMemberCustomField(memberCustomFields: MemberCustomFieldsByPolicyID | undefined, previousMemberCustomFields: MemberCustomFieldsByPolicyID | undefined): boolean {
    if (!memberCustomFields || !previousMemberCustomFields) {
        return false;
    }

    const customFieldKeys = Object.values(CONST.CUSTOM_FIELD_KEYS);
    for (const [policyID, customFieldsByLogin] of Object.entries(memberCustomFields)) {
        const previousCustomFieldsByLogin = previousMemberCustomFields[policyID];
        if (!previousCustomFieldsByLogin) {
            continue;
        }
        for (const [login, customFields] of Object.entries(customFieldsByLogin)) {
            const previousCustomFields = previousCustomFieldsByLogin[login];
            if (previousCustomFields && customFieldKeys.some((key) => customFields[key] !== previousCustomFields[key])) {
                return true;
            }
        }
    }

    return false;
}

export default useSearchAutoRefetch;
export {getPolicyIDsFromSearchResults};
export type {UseSearchAutoRefetch};
