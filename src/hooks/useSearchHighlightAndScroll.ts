import type {TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {search} from '@libs/actions/Search';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isReportActionEntry} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {ReportActions, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';

type UseSearchAutoRefetch = {
    searchResults: OnyxEntry<SearchResults>;
    transactions: OnyxCollection<Transaction>;
    previousTransactions: OnyxCollection<Transaction>;
    reportActions: OnyxCollection<ReportActions>;
    previousReportActions: OnyxCollection<ReportActions>;
    queryJSON: SearchQueryJSON;
    searchKey: SearchKey | undefined;
    offset: number;
    shouldCalculateTotals: boolean;
    shouldUseLiveData: boolean;
};

/**
 * Hook used to trigger a search when a new transaction or report action is added, so the Search snapshot
 * reflects freshly-created entries. Also returns the newly-added transactions, which the grouped views use to
 * refetch each expanded group's child snapshot.
 */
function useSearchAutoRefetch({
    searchResults,
    transactions,
    previousTransactions,
    reportActions,
    previousReportActions,
    queryJSON,
    searchKey,
    offset,
    shouldCalculateTotals,
    shouldUseLiveData,
}: UseSearchAutoRefetch) {
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const searchTriggeredRef = useRef(false);
    const hasPendingSearchRef = useRef(false);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

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

    // Trigger search when a new report action is added while on chat or when a new transaction is added for the other search types.
    useEffect(() => {
        const previousTransactionIDsLocal = Object.keys(previousTransactions ?? {});
        const transactionsIDs = Object.keys(transactions ?? {});

        const reportActionsIDs = Object.values(reportActions ?? {})
            .map((actions) => Object.keys(actions ?? {}))
            .flat();
        const previousReportActionsIDs = Object.values(previousReportActions ?? {})
            .map((actions) => Object.keys(actions ?? {}))
            .flat();

        // Only proceed if we have previous data to compare against
        // This prevents triggering on initial data load
        if ((previousTransactionIDsLocal.length === 0 && previousReportActionsIDs.length === 0) || searchTriggeredRef.current) {
            return;
        }

        const previousTransactionsIDsSet = new Set(previousTransactionIDsLocal);
        const previousReportActionsIDsSet = new Set(previousReportActionsIDs);
        const hasTransactionsIDsChange = transactionsIDs.length !== previousTransactionIDsLocal.length || transactionsIDs.some((id) => !previousTransactionsIDsSet.has(id));
        const hasReportActionsIDsChange = reportActionsIDs.some((id) => !previousReportActionsIDsSet.has(id));

        // Check if there is a change in the transactions or report actions list
        if ((!isChat && hasTransactionsIDsChange) || hasReportActionsIDsChange || hasPendingSearchRef.current) {
            // Skip if offline, or if the user has navigated to a different fullscreen page entirely.
            // An RHP layered on top of Search makes `isFocused` false but keeps Search as the topmost
            // fullscreen route, so we still want to refetch — otherwise the snapshot can't reflect
            // entries the user creates from the RHP until they close it.
            const isSearchStillActive = isFocused || isSearchTopmostFullScreenRoute();
            if (!isSearchStillActive || isOffline) {
                hasPendingSearchRef.current = true;
                return;
            }
            hasPendingSearchRef.current = false;

            const newIDs = isChat ? reportActionsIDs : transactionsIDs;
            let currentSearchResultIDs: string[] = [];
            if (searchResultsData) {
                currentSearchResultIDs = isChat ? extractReportActionIDsFromSearchResults(searchResultsData) : extractTransactionIDsFromSearchResults(searchResultsData);
            }
            const existingSearchResultIDsSet = new Set(currentSearchResultIDs);
            const hasAGenuinelyNewID = newIDs.some((id) => !existingSearchResultIDsSet.has(id));

            // Only skip search if there are no new items AND search results aren't empty
            // This ensures deletions that result in empty data still trigger search
            if (!hasAGenuinelyNewID && currentSearchResultIDs.length > 0) {
                const newIDsSet = new Set(newIDs);
                const hasDeletedID = currentSearchResultIDs.some((id) => !newIDsSet.has(id));
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
        isChat,
        searchResultsData,
        isOffline,
        searchResults?.search?.isLoading,
    ]);

    useEffect(() => {
        // For live data, isLoading is always false, so we also need to reset when searchResultsData changes
        // For snapshot data, we wait for isLoading to become false after the API call completes
        if (searchResults?.search?.isLoading) {
            return;
        }

        searchTriggeredRef.current = false;
    }, [searchResults?.search?.isLoading, shouldUseLiveData, searchResultsData]);

    return {newTransactions};
}

/**
 * Helper function to extract transaction IDs from search results data.
 */
function extractTransactionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    const transactionIDs: string[] = [];

    for (const item of Object.values(searchResultsData)) {
        // Check for transactionID directly on the item (TransactionListItemType)
        if ((item as TransactionListItemType)?.transactionID) {
            transactionIDs.push((item as TransactionListItemType).transactionID);
        }

        // Check for transactions array within the item (TransactionGroupListItemType)
        if (Array.isArray((item as TransactionGroupListItemType)?.transactions)) {
            for (const transaction of (item as TransactionGroupListItemType).transactions) {
                if (!transaction?.transactionID) {
                    continue;
                }
                transactionIDs.push(transaction.transactionID);
            }
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

export default useSearchAutoRefetch;
export type {UseSearchAutoRefetch};
