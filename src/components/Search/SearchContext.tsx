import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid circular dependencies in SearchContext
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTodos from '@hooks/useTodos';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {getSuggestedSearches, isTodoSearch, isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from './types';

// Default search info when building from live data
// Used for to-do searches where we build SearchResults from live Onyx data instead of API snapshots
const defaultSearchInfo: SearchResultsInfo = {
    offset: 0,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    hasMoreResults: false,
    hasResults: true,
    isLoading: false,
    count: 0,
    total: 0,
    currency: '',
};

/**
 * Search State - All the data/values that represent the current search state
 * Following the composition pattern: state/actions/meta organization
 */
type SearchState = {
    currentSearchHash: number;
    currentSearchKey: SearchKey | undefined;
    currentSearchQueryJSON: SearchQueryJSON | undefined;
    currentSearchResults: SearchResults | undefined;
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    isOnSearch: boolean;
    shouldTurnOffSelectionMode: boolean;
    shouldResetSearchQuery: boolean;
    shouldShowFiltersBarLoading: boolean;
    lastSearchType: string | undefined;
    showSelectAllMatchingItems: boolean;
    areAllMatchingItemsSelected: boolean;
    shouldUseLiveData: boolean;
};

/**
 * Search Actions - All the functions that modify the search state
 * Following the composition pattern: state/actions/meta organization
 */
type SearchActions = {
    setCurrentSearchHashAndKey: (hash: number, key: SearchKey | undefined) => void;
    setCurrentSearchQueryJSON: (searchQueryJSON: SearchQueryJSON | undefined) => void;
    setSelectedTransactions: {
        (selectedTransactionIDs: string[], unused?: undefined): void;
        (selectedTransactions: SelectedTransactions, data: Parameters<SearchActions['setSelectedTransactions']>[1]): void;
    };
    clearSelectedTransactions: {
        (hash?: number, shouldTurnOffSelectionMode?: boolean): void;
        (clearIDs: true, unused?: undefined): void;
    };
    removeTransaction: (transactionID: string | undefined) => void;
    setShouldShowFiltersBarLoading: (shouldShow: boolean) => void;
    setLastSearchType: (type: string | undefined) => void;
    shouldShowSelectAllMatchingItems: (shouldShow: boolean) => void;
    selectAllMatchingItems: (on: boolean) => void;
    setShouldResetSearchQuery: (shouldReset: boolean) => void;
};

/**
 * Search Meta - Configuration and metadata that doesn't change frequently
 * Following the composition pattern: state/actions/meta organization
 */
type SearchMeta = {
    /** The current search hash for quick comparison */
    hash: number;
    /** The search key for identifying the search type */
    searchKey: SearchKey | undefined;
};

/**
 * Combined Search Context Props - Organized by state/actions/meta
 * This follows the composition pattern from Fernando Rojo's talk
 */
type SearchContextProps = {
    state: SearchState;
    actions: SearchActions;
    meta: SearchMeta;
};

// Default state values
const defaultSearchState: SearchState = {
    currentSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
    shouldShowFiltersBarLoading: false,
    lastSearchType: undefined,
    showSelectAllMatchingItems: false,
    areAllMatchingItemsSelected: false,
    shouldUseLiveData: false,
};

// Default actions (no-op functions)
const defaultSearchActions: SearchActions = {
    setCurrentSearchHashAndKey: () => {},
    setCurrentSearchQueryJSON: () => {},
    setSelectedTransactions: () => {},
    clearSelectedTransactions: () => {},
    removeTransaction: () => {},
    setShouldShowFiltersBarLoading: () => {},
    setLastSearchType: () => {},
    shouldShowSelectAllMatchingItems: () => {},
    selectAllMatchingItems: () => {},
    setShouldResetSearchQuery: () => {},
};

// Default meta
const defaultSearchMeta: SearchMeta = {
    hash: -1,
    searchKey: undefined,
};

const defaultSearchContext: SearchContextProps = {
    state: defaultSearchState,
    actions: defaultSearchActions,
    meta: defaultSearchMeta,
};

const SearchContext = React.createContext<SearchContextProps>(defaultSearchContext);

type SearchContextInternalData = {
    currentSearchHash: number;
    currentSearchKey: SearchKey | undefined;
    currentSearchQueryJSON: SearchQueryJSON | undefined;
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    isOnSearch: boolean;
    shouldTurnOffSelectionMode: boolean;
    shouldResetSearchQuery: boolean;
};

const defaultSearchContextInternalData: SearchContextInternalData = {
    currentSearchHash: -1,
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
    shouldResetSearchQuery: false,
};

function SearchContextProvider({children}: ChildrenProps) {
    const [showSelectAllMatchingItems, shouldShowSelectAllMatchingItems] = useState(false);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<string | undefined>(undefined);
    const [searchContextData, setSearchContextData] = useState(defaultSearchContextInternalData);
    const areTransactionsEmpty = useRef(true);

    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContextData.currentSearchHash}`, {canBeMissing: true});
    const {todoSearchResultsData} = useTodos();

    const currentSearchKey = searchContextData.currentSearchKey;
    const currentSearchHash = searchContextData.currentSearchHash;
    const {accountID} = useCurrentUserPersonalDetails();
    const suggestedSearches = useMemo(() => getSuggestedSearches(accountID), [accountID]);
    const shouldUseLiveData = !!currentSearchKey && isTodoSearch(currentSearchHash, suggestedSearches);

    // If viewing a to-do search, use live data from useTodos, otherwise return the snapshot data
    // We do this so that we can show the counters for the to-do search results without visiting the specific to-do page, e.g. show `Approve [3]` while viewing the `Submit` to-do search.
    const currentSearchResults = useMemo((): SearchResults | undefined => {
        if (shouldUseLiveData) {
            const liveData = todoSearchResultsData[currentSearchKey as keyof typeof todoSearchResultsData];
            const searchInfo: SearchResultsInfo = {
                ...(snapshotSearchResults?.search ?? defaultSearchInfo),
                count: liveData.metadata.count,
                total: liveData.metadata.total,
                currency: liveData.metadata.currency,
            };
            const hasResults = Object.keys(liveData.data).length > 0;
            // For to-do searches, always return a valid SearchResults object (even with empty data)
            // This ensures we show the empty state instead of loading/blocking views
            return {
                search: {...searchInfo, isLoading: false, hasResults},
                data: liveData.data,
            };
        }

        return snapshotSearchResults ?? undefined;
    }, [shouldUseLiveData, currentSearchKey, todoSearchResultsData, snapshotSearchResults]);

    const setCurrentSearchHashAndKey = useCallback((searchHash: number, searchKey: SearchKey | undefined) => {
        setSearchContextData((prevState) => {
            if (searchHash === prevState.currentSearchHash && searchKey === prevState.currentSearchKey) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchHash: searchHash,
                currentSearchKey: searchKey,
            };
        });
    }, []);

    const setCurrentSearchQueryJSON = useCallback((searchQueryJSON: SearchQueryJSON | undefined) => {
        setSearchContextData((prevState) => {
            if (searchQueryJSON === prevState.currentSearchQueryJSON) {
                return prevState;
            }

            return {
                ...prevState,
                currentSearchQueryJSON: searchQueryJSON,
            };
        });
    }, []);

    const setSelectedTransactions: SearchActions['setSelectedTransactions'] = useCallback((selectedTransactions, data = []) => {
        if (selectedTransactions instanceof Array) {
            if (!selectedTransactions.length && areTransactionsEmpty.current) {
                areTransactionsEmpty.current = true;
                return;
            }
            areTransactionsEmpty.current = false;
            return setSearchContextData((prevState) => ({
                ...prevState,
                selectedTransactionIDs: selectedTransactions,
            }));
        }

        // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
        let selectedReports: SelectedReports[] = [];

        if (data.length && data.every(isTransactionReportGroupListItemType)) {
            selectedReports = data
                .filter((item) => isMoneyRequestReport(item) && item.transactions.length > 0 && item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected))
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action], currency, chatReportID}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                    currency,
                    chatReportID,
                }));
        } else if (data.length && data.every(isTransactionListItemType)) {
            selectedReports = data
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, amount: total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action], currency, report}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                    currency,
                    chatReportID: report?.chatReportID,
                }));
        }

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedTransactions,
            shouldTurnOffSelectionMode: false,
            selectedReports,
        }));
    }, []);

    const clearSelectedTransactions: SearchActions['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            if (searchHashOrClearIDsFlag === searchContextData.currentSearchHash) {
                return;
            }

            if (searchContextData.selectedReports.length === 0 && isEmptyObject(searchContextData.selectedTransactions) && !searchContextData.shouldTurnOffSelectionMode) {
                return;
            }
            setSearchContextData((prevState) => ({
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
                selectedReports: [],
            }));

            // Unselect all transactions and hide the "select all matching items" option
            shouldShowSelectAllMatchingItems(false);
            selectAllMatchingItems(false);
        },
        [
            searchContextData.currentSearchHash,
            searchContextData.selectedReports.length,
            searchContextData.selectedTransactions,
            searchContextData.shouldTurnOffSelectionMode,
            setSelectedTransactions,
        ],
    );

    const removeTransaction: SearchActions['removeTransaction'] = useCallback(
        (transactionID) => {
            if (!transactionID) {
                return;
            }
            const selectedTransactionIDs = searchContextData.selectedTransactionIDs;

            if (!isEmptyObject(searchContextData.selectedTransactions)) {
                const newSelectedTransactions = Object.entries(searchContextData.selectedTransactions).reduce((acc, [key, value]) => {
                    if (key === transactionID) {
                        return acc;
                    }
                    acc[key] = value;
                    return acc;
                }, {} as SelectedTransactions);

                setSearchContextData((prevState) => ({
                    ...prevState,
                    selectedTransactions: newSelectedTransactions,
                }));
            }

            if (selectedTransactionIDs.length > 0) {
                setSearchContextData((prevState) => ({
                    ...prevState,
                    selectedTransactionIDs: selectedTransactionIDs.filter((ID) => transactionID !== ID),
                }));
            }
        },
        [searchContextData.selectedTransactionIDs, searchContextData.selectedTransactions],
    );

    const setShouldResetSearchQuery = useCallback((shouldReset: boolean) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            shouldResetSearchQuery: shouldReset,
        }));
    }, []);

    // Build the state object following composition pattern
    const state: SearchState = useMemo(
        () => ({
            currentSearchHash: searchContextData.currentSearchHash,
            currentSearchKey: searchContextData.currentSearchKey,
            currentSearchQueryJSON: searchContextData.currentSearchQueryJSON,
            currentSearchResults,
            selectedTransactions: searchContextData.selectedTransactions,
            selectedTransactionIDs: searchContextData.selectedTransactionIDs,
            selectedReports: searchContextData.selectedReports,
            isOnSearch: searchContextData.isOnSearch,
            shouldTurnOffSelectionMode: searchContextData.shouldTurnOffSelectionMode,
            shouldResetSearchQuery: searchContextData.shouldResetSearchQuery,
            shouldShowFiltersBarLoading,
            lastSearchType,
            showSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            shouldUseLiveData,
        }),
        [
            searchContextData,
            currentSearchResults,
            shouldShowFiltersBarLoading,
            lastSearchType,
            showSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            shouldUseLiveData,
        ],
    );

    // Build the actions object following composition pattern
    const actions: SearchActions = useMemo(
        () => ({
            setCurrentSearchHashAndKey,
            setCurrentSearchQueryJSON,
            setSelectedTransactions,
            clearSelectedTransactions,
            removeTransaction,
            setShouldShowFiltersBarLoading,
            setLastSearchType,
            shouldShowSelectAllMatchingItems,
            selectAllMatchingItems,
            setShouldResetSearchQuery,
        }),
        [
            setCurrentSearchHashAndKey,
            setCurrentSearchQueryJSON,
            setSelectedTransactions,
            clearSelectedTransactions,
            removeTransaction,
            setShouldResetSearchQuery,
        ],
    );

    // Build the meta object following composition pattern
    const meta: SearchMeta = useMemo(
        () => ({
            hash: searchContextData.currentSearchHash,
            searchKey: searchContextData.currentSearchKey,
        }),
        [searchContextData.currentSearchHash, searchContextData.currentSearchKey],
    );

    // Combine into the final context value
    const searchContext = useMemo<SearchContextProps>(
        () => ({
            state,
            actions,
            meta,
        }),
        [state, actions, meta],
    );

    return <SearchContext.Provider value={searchContext}>{children}</SearchContext.Provider>;
}

/**
 * Hook to access the Search context
 * Returns the context organized by state/actions/meta following composition pattern
 *
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchContext() {
    return useContext(SearchContext);
}

/**
 * Legacy hook for backward compatibility during migration
 * This flattens the state/actions structure for components not yet migrated
 * @deprecated Use useSearchContext() with state/actions/meta structure instead
 */
function useSearchContextLegacy() {
    const {state, actions} = useContext(SearchContext);
    return {
        ...state,
        ...actions,
    };
}

export {SearchContextProvider, useSearchContext, useSearchContextLegacy, SearchContext};
export type {SearchContextProps, SearchState, SearchActions, SearchMeta};
