import type {SearchActionsContextValue, SearchStateContextValue} from '@components/Search/types';

import {getSuggestedSearches} from '@libs/SearchUIUtils';

/** Keeps Search containers and action mocks independent between header renders. */
function createMockSearchContext(): {state: SearchStateContextValue; actions: SearchActionsContextValue} {
    const state: SearchStateContextValue = {
        currentSearchHash: 12345,
        currentSearchKey: undefined,
        currentSearchQueryJSON: undefined,
        currentDefaultSearchQueryJSON: undefined,
        currentDefaultSearchQueryFilterKeys: new Set(),
        currentSearchResults: undefined,
        currentSearchTransactionsByReportID: new Map(),
        currentSearchViolations: undefined,
        currentSelectedTransactionReportID: undefined,
        selectedReports: [],
        selectedTransactionIDs: [],
        selectedTransactions: {},
        excludedTransactions: {},
        shouldTurnOffSelectionMode: false,
        shouldResetSearchQuery: false,
        lastSearchType: undefined,
        areAllMatchingItemsSelected: false,
        shouldShowFiltersBarLoading: false,
        shouldUseLiveData: false,
        currentSimilarSearchHash: -1,
        suggestedSearches: getSuggestedSearches(),
        sortedReportIDs: [],
        hasSelectedTransactions: false,
    };

    const actions: SearchActionsContextValue = {
        setLastSearchType: jest.fn(),
        setCurrentSelectedTransactionReportID: jest.fn(),
        setSelectedTransactions: jest.fn(),
        getSelectedTransactions: jest.fn(() => ({})),
        getExcludedTransactions: () => ({}),
        getAreAllMatchingItemsSelected: () => false,
        applySelection: jest.fn(),
        setSelectedReports: jest.fn(),
        removeTransaction: jest.fn(),
        clearSelectedTransactions: jest.fn(),
        setShouldShowFiltersBarLoading: jest.fn(),
        selectAllMatchingItems: jest.fn(),
        setShouldResetSearchQuery: jest.fn(),
        setSortedReportIDs: jest.fn(),
        getSearchKeyForQuery: jest.fn(),
    };

    return {state, actions};
}

export default createMockSearchContext;
