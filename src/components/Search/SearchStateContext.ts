import React from 'react';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';
import type {SearchContextData, SearchStateContextValue} from './types';

/**
 * SearchStateContext is extracted into its own file to avoid pulling in heavy
 * SearchContext.tsx dependencies (useCardFeedsForDisplay, SearchQueryUtils, etc.)
 * when only the context object is needed (e.g., in useOnyx.ts).
 */

const defaultSearchContextData: SearchContextData = {
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    currentSelectedTransactionReportID: undefined,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    currentSearchHash: -1,
    currentSimilarSearchHash: -1,
    suggestedSearches: {} as Record<SearchKey, SearchTypeMenuItem>,
};

const defaultSearchStateContext: SearchStateContextValue = {
    ...defaultSearchContextData,
    lastSearchType: undefined,
    areAllMatchingItemsSelected: false,
    shouldShowSelectAllMatchingItems: false,
    shouldShowActionsBarLoading: false,
    currentSearchResults: undefined,
    shouldUseLiveData: false,
};

const SearchStateContext = React.createContext<SearchStateContextValue>(defaultSearchStateContext);

export {SearchStateContext, defaultSearchContextData};
