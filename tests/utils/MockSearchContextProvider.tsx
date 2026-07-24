import {
    SearchQueryActionsContext,
    SearchQueryContext,
    SearchResultsActionsContext,
    SearchResultsContext,
    SearchSelectionActionsContext,
    SearchSelectionContext,
} from '@components/Search/SearchContext';
import type {
    SearchActionsContextValue,
    SearchQueryActionsValue,
    SearchQueryContextValue,
    SearchResultsActionsValue,
    SearchResultsContextValue,
    SearchSelectionActionsValue,
    SearchSelectionContextValue,
    SearchStateContextValue,
} from '@components/Search/types';

import React from 'react';

type MockSearchContextProviderProps = {
    state: SearchStateContextValue;
    actions: SearchActionsContextValue;
    children: React.ReactNode;
};

function splitState(value: SearchStateContextValue): {
    query: SearchQueryContextValue;
    results: SearchResultsContextValue;
    selection: SearchSelectionContextValue;
} {
    return {
        query: {
            currentSearchHash: value.currentSearchHash,
            currentSimilarSearchHash: value.currentSimilarSearchHash,
            currentSearchKey: value.currentSearchKey,
            currentSearchQueryJSON: value.currentSearchQueryJSON,
            suggestedSearches: value.suggestedSearches,
            shouldResetSearchQuery: value.shouldResetSearchQuery,
        },
        results: {
            currentSearchResults: value.currentSearchResults,
            shouldUseLiveData: value.shouldUseLiveData,
            sortedReportIDs: value.sortedReportIDs,
            shouldShowFiltersBarLoading: value.shouldShowFiltersBarLoading,
            lastSearchType: value.lastSearchType,
        },
        selection: {
            selectedTransactions: value.selectedTransactions,
            excludedTransactions: value.excludedTransactions,
            selectedTransactionIDs: value.selectedTransactionIDs,
            selectedReports: value.selectedReports,
            currentSelectedTransactionReportID: value.currentSelectedTransactionReportID,
            shouldTurnOffSelectionMode: value.shouldTurnOffSelectionMode,
            hasSelectedTransactions: value.hasSelectedTransactions,
            areAllMatchingItemsSelected: value.areAllMatchingItemsSelected,
        },
    };
}

function splitActions(value: SearchActionsContextValue): {
    query: SearchQueryActionsValue;
    results: SearchResultsActionsValue;
    selection: SearchSelectionActionsValue;
} {
    return {
        query: {setShouldResetSearchQuery: value.setShouldResetSearchQuery},
        results: {
            setSortedReportIDs: value.setSortedReportIDs,
            setShouldShowFiltersBarLoading: value.setShouldShowFiltersBarLoading,
            setLastSearchType: value.setLastSearchType,
        },
        selection: {
            setSelectedTransactions: value.setSelectedTransactions,
            applySelection: value.applySelection,
            setSelectedReports: value.setSelectedReports,
            setCurrentSelectedTransactionReportID: value.setCurrentSelectedTransactionReportID,
            clearSelectedTransactions: value.clearSelectedTransactions,
            removeTransaction: value.removeTransaction,
            selectAllMatchingItems: value.selectAllMatchingItems,
        },
    };
}

function MockSearchContextProvider({state, actions, children}: MockSearchContextProviderProps) {
    const stateSlices = splitState(state);
    const actionsSlices = splitActions(actions);
    return (
        <SearchQueryContext value={stateSlices.query}>
            <SearchQueryActionsContext value={actionsSlices.query}>
                <SearchResultsContext value={stateSlices.results}>
                    <SearchResultsActionsContext value={actionsSlices.results}>
                        <SearchSelectionContext value={stateSlices.selection}>
                            <SearchSelectionActionsContext value={actionsSlices.selection}>{children}</SearchSelectionActionsContext>
                        </SearchSelectionContext>
                    </SearchResultsActionsContext>
                </SearchResultsContext>
            </SearchQueryActionsContext>
        </SearchQueryContext>
    );
}

export default MockSearchContextProvider;
