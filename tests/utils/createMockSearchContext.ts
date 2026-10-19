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
        setLastSearchType: jest.fn<ReturnType<SearchActionsContextValue['setLastSearchType']>, Parameters<SearchActionsContextValue['setLastSearchType']>>(),
        setCurrentSelectedTransactionReportID: jest.fn<
            ReturnType<SearchActionsContextValue['setCurrentSelectedTransactionReportID']>,
            Parameters<SearchActionsContextValue['setCurrentSelectedTransactionReportID']>
        >(),
        setSelectedTransactions: jest.fn<void, []>(),
        getSelectedTransactions: jest.fn<ReturnType<SearchActionsContextValue['getSelectedTransactions']>, []>(() => ({})),
        getExcludedTransactions: () => ({}),
        getAreAllMatchingItemsSelected: () => false,
        applySelection: jest.fn<ReturnType<SearchActionsContextValue['applySelection']>, Parameters<SearchActionsContextValue['applySelection']>>(),
        setSelectedReports: jest.fn<ReturnType<SearchActionsContextValue['setSelectedReports']>, Parameters<SearchActionsContextValue['setSelectedReports']>>(),
        removeTransaction: jest.fn<ReturnType<SearchActionsContextValue['removeTransaction']>, Parameters<SearchActionsContextValue['removeTransaction']>>(),
        clearSelectedTransactions: jest.fn<void, []>(),
        setShouldShowFiltersBarLoading: jest.fn<
            ReturnType<SearchActionsContextValue['setShouldShowFiltersBarLoading']>,
            Parameters<SearchActionsContextValue['setShouldShowFiltersBarLoading']>
        >(),
        selectAllMatchingItems: jest.fn<ReturnType<SearchActionsContextValue['selectAllMatchingItems']>, Parameters<SearchActionsContextValue['selectAllMatchingItems']>>(),
        setShouldResetSearchQuery: jest.fn<ReturnType<SearchActionsContextValue['setShouldResetSearchQuery']>, Parameters<SearchActionsContextValue['setShouldResetSearchQuery']>>(),
        setSortedReportIDs: jest.fn<ReturnType<SearchActionsContextValue['setSortedReportIDs']>, Parameters<SearchActionsContextValue['setSortedReportIDs']>>(),
        getSearchKeyForQuery: jest.fn<ReturnType<SearchActionsContextValue['getSearchKeyForQuery']>, Parameters<SearchActionsContextValue['getSearchKeyForQuery']>>(),
    };

    return {state, actions};
}

export default createMockSearchContext;
