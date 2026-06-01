import React from 'react';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchQueryActionsValue, SearchQueryContextValue, SearchResultsActionsValue, SearchResultsContextValue, SearchSelectionActionsValue, SearchSelectionContextValue} from './types';

// This file holds the bare React.createContext() calls so they can be imported by `@hooks/useOnyx`
// without triggering the SearchQueryProvider -> useCardFeedsForDisplay -> @hooks/useOnyx ->
// SearchQueryProvider circular dependency that caused TDZ errors under React Refresh.

const defaultSearchQueryContext: SearchQueryContextValue = {
    currentSearchHash: -1,
    currentSimilarSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    suggestedSearches: {} as Record<SearchKey, SearchTypeMenuItem>,
    shouldResetSearchQuery: false,
};

const defaultSearchQueryActions: SearchQueryActionsValue = {
    setShouldResetSearchQuery: () => {},
};

const defaultSearchResultsContext: SearchResultsContextValue = {
    currentSearchResults: undefined,
    shouldUseLiveData: false,
    sortedReportIDs: CONST.EMPTY_ARRAY,
    shouldShowFiltersBarLoading: false,
    lastSearchType: undefined,
};

const defaultSearchResultsActions: SearchResultsActionsValue = {
    setSortedReportIDs: () => {},
    setShouldShowFiltersBarLoading: () => {},
    setLastSearchType: () => {},
};

const defaultSearchSelectionContext: SearchSelectionContextValue = {
    currentSelectedTransactionReportID: undefined,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    shouldTurnOffSelectionMode: false,
    hasSelectedTransactions: false,
    areAllMatchingItemsSelected: false,
};

const defaultSearchSelectionActions: SearchSelectionActionsValue = {
    setSelectedTransactions: () => {},
    setSelectedReports: () => {},
    setCurrentSelectedTransactionReportID: () => {},
    clearSelectedTransactions: () => {},
    removeTransaction: () => {},
    selectAllMatchingItems: () => {},
};

const SearchQueryContext = React.createContext<SearchQueryContextValue>(defaultSearchQueryContext);
const SearchQueryActionsContext = React.createContext<SearchQueryActionsValue>(defaultSearchQueryActions);
const SearchResultsContext = React.createContext<SearchResultsContextValue>(defaultSearchResultsContext);
const SearchResultsActionsContext = React.createContext<SearchResultsActionsValue>(defaultSearchResultsActions);
const SearchSelectionContext = React.createContext<SearchSelectionContextValue>(defaultSearchSelectionContext);
const SearchSelectionActionsContext = React.createContext<SearchSelectionActionsValue>(defaultSearchSelectionActions);

export {SearchQueryContext, SearchQueryActionsContext, SearchResultsContext, SearchResultsActionsContext, SearchSelectionContext, SearchSelectionActionsContext};
