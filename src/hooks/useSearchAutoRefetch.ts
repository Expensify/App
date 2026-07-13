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

type UseSearchAutoRefetchParams = {
    /** Current search snapshot. */
    searchResults: OnyxEntry<SearchResults>;

    /** Live transaction collection. */
    transactions: OnyxCollection<Transaction>;

    /** Previous transaction collection. */
    previousTransactions: OnyxCollection<Transaction>;

    /** Live report-actions collection. */
    reportActions: OnyxCollection<ReportActions>;

    /** Previous report-actions collection. */
    previousReportActions: OnyxCollection<ReportActions>;

    /** Parsed query driving the refetch. */
    queryJSON: SearchQueryJSON;

    /** Suggested-search key passed through to the refetch. */
    searchKey: SearchKey | undefined;

    /** Pagination offset passed through to the refetch. */
    offset: number;

    /** Whether the refetch should recompute list totals. */
    shouldCalculateTotals: boolean;
};

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
}: UseSearchAutoRefetchParams) {
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const searchTriggeredRef = useRef(false);
    const hasPendingSearchRef = useRef(false);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;
    const searchResultsData = searchResults?.data;

    useEffect(() => {
        const previousTransactionIDsLocal = Object.keys(previousTransactions ?? {});
        const transactionsIDs = Object.keys(transactions ?? {});

        const reportActionsIDs = Object.values(reportActions ?? {})
            .map((actions) => Object.keys(actions ?? {}))
            .flat();
        const previousReportActionsIDs = Object.values(previousReportActions ?? {})
            .map((actions) => Object.keys(actions ?? {}))
            .flat();

        if ((previousTransactionIDsLocal.length === 0 && previousReportActionsIDs.length === 0) || searchTriggeredRef.current) {
            return;
        }

        const previousTransactionsIDsSet = new Set(previousTransactionIDsLocal);
        const previousReportActionsIDsSet = new Set(previousReportActionsIDs);
        const hasTransactionsIDsChange = transactionsIDs.length !== previousTransactionIDsLocal.length || transactionsIDs.some((id) => !previousTransactionsIDsSet.has(id));
        const hasReportActionsIDsChange = reportActionsIDs.some((id) => !previousReportActionsIDsSet.has(id));

        if ((!isChat && hasTransactionsIDsChange) || hasReportActionsIDsChange || hasPendingSearchRef.current) {
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

            // Only skip search if there are no new items AND search results aren't empty.
            // This ensures deletions that result in empty data still trigger search.
            if (!hasAGenuinelyNewID && currentSearchResultIDs.length > 0) {
                const newIDsSet = new Set(newIDs);
                const hasDeletedID = currentSearchResultIDs.some((id) => !newIDsSet.has(id));
                if (!hasDeletedID) {
                    return;
                }
            }

            TransitionTracker.runAfterTransitions({
                callback: () => {
                    search({queryJSON, searchKey, offset, shouldCalculateTotals, isLoading: !!searchResults?.search?.isLoading});
                },
            });

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
        // For live data, isLoading is always false, so we also need to reset when searchResultsData changes.
        // For snapshot data, we wait for isLoading to become false after the API call completes.
        if (searchResults?.search?.isLoading) {
            return;
        }

        searchTriggeredRef.current = false;
    }, [searchResults?.search?.isLoading, searchResultsData]);
}

function getTransactionIDFromValue(value: unknown): string | undefined {
    if (!value || typeof value !== 'object' || !('transactionID' in value)) {
        return undefined;
    }
    const {transactionID} = value;
    return typeof transactionID === 'string' && transactionID ? transactionID : undefined;
}

function extractTransactionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    const transactionIDs: string[] = [];

    for (const item of Object.values(searchResultsData)) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const itemTransactionID = getTransactionIDFromValue(item);
        if (itemTransactionID) {
            transactionIDs.push(itemTransactionID);
        }

        if ('transactions' in item && Array.isArray(item.transactions)) {
            for (const transaction of item.transactions) {
                const transactionID = getTransactionIDFromValue(transaction);
                if (transactionID) {
                    transactionIDs.push(transactionID);
                }
            }
        }
    }

    return transactionIDs;
}

function extractReportActionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    return Object.keys(searchResultsData ?? {})
        .filter(isReportActionEntry)
        .map((key) => Object.keys(searchResultsData[key] ?? {}))
        .flat();
}

export default useSearchAutoRefetch;
export type {UseSearchAutoRefetchParams};
