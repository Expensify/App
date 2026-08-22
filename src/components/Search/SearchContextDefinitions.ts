import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {
    QueryFilters,
    SearchQueryActionsValue,
    SearchQueryContextValue,
    SearchResultsActionsValue,
    SearchResultsContextValue,
    SearchRowSelectionActionsValue,
    SearchSelectionActionsValue,
    SearchSelectionContextValue,
} from './types';

// This file holds the bare React.createContext() calls so they can be imported by `@hooks/useOnyx`
// without triggering the SearchQueryProvider -> useCardFeedsForDisplay -> @hooks/useOnyx ->
// SearchQueryProvider circular dependency that caused TDZ errors under React Refresh.

const defaultSearchQueryContext: SearchQueryContextValue = {
    currentSearchHash: -1,
    currentSimilarSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set<QueryFilters[number]['key']>(),
    suggestedSearches: {} as Record<SearchKey, SearchTypeMenuItem>,
    shouldResetSearchQuery: false,
};

const defaultSearchQueryActions: SearchQueryActionsValue = {
    setShouldResetSearchQuery: () => {},
    setCurrentSearchKey: () => {},
    resetSearchKey: () => {},
};

const EMPTY_TRANSACTIONS_BY_REPORT_ID: SearchResultsContextValue['currentSearchTransactionsByReportID'] = new Map();

const defaultSearchResultsContext: SearchResultsContextValue = {
    currentSearchResults: undefined,
    currentSearchTransactionsByReportID: EMPTY_TRANSACTIONS_BY_REPORT_ID,
    currentSearchViolations: CONST.EMPTY_OBJECT,
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
    excludedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    shouldTurnOffSelectionMode: false,
    hasSelectedTransactions: false,
    areAllMatchingItemsSelected: false,
};

const defaultSearchSelectionActions: SearchSelectionActionsValue = {
    setSelectedTransactions: () => {},
    applySelection: () => {},
    setSelectedReports: () => {},
    setCurrentSelectedTransactionReportID: () => {},
    clearSelectedTransactions: () => {},
    removeTransaction: () => {},
    selectAllMatchingItems: () => {},
};

const defaultRowSelectionActions: SearchRowSelectionActionsValue = {
    toggle: () => {},
    toggleAll: () => {},
};

const SearchQueryContext = React.createContext<SearchQueryContextValue>(defaultSearchQueryContext);
const SearchQueryActionsContext = React.createContext<SearchQueryActionsValue>(defaultSearchQueryActions);
const SearchResultsContext = React.createContext<SearchResultsContextValue>(defaultSearchResultsContext);
const SearchResultsActionsContext = React.createContext<SearchResultsActionsValue>(defaultSearchResultsActions);
const SearchSelectionContext = React.createContext<SearchSelectionContextValue>(defaultSearchSelectionContext);
const SearchSelectionActionsContext = React.createContext<SearchSelectionActionsValue>(defaultSearchSelectionActions);
const SearchRowSelectionActionsContext = React.createContext<SearchRowSelectionActionsValue>(defaultRowSelectionActions);

export {
    EMPTY_TRANSACTIONS_BY_REPORT_ID,
    SearchQueryContext,
    SearchQueryActionsContext,
    SearchResultsContext,
    SearchResultsActionsContext,
    SearchSelectionContext,
    SearchSelectionActionsContext,
    SearchRowSelectionActionsContext,
};
