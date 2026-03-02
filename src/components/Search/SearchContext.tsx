import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid circular dependencies in SearchContext
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useTodos from '@hooks/useTodos';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSuggestedSearches, isTodoSearch, isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchActionsContextValue, SearchContextData, SearchStateContextValue, SelectedTransactions} from './types';

type SearchContextProps = {
    children: React.ReactNode;
    params?: PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>['route']['params'];
};

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

const defaultSearchContextData: SearchContextData = {
    currentSearchKey: undefined,
    currentSearchQueryJSON: undefined,
    currentSearchResults: undefined,
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
    shouldShowFiltersBarLoading: false,
    currentSearchResults: undefined,
    shouldUseLiveData: false,
};

const defaultSearchActionsContext: SearchActionsContextValue = {
    setLastSearchType: () => {},
    setSelectedTransactions: () => {},
    removeTransaction: () => {},
    clearSelectedTransactions: () => {},
    setShouldShowFiltersBarLoading: () => {},
    setShouldShowSelectAllMatchingItems: () => {},
    selectAllMatchingItems: () => {},
    setShouldResetSearchQuery: () => {},
};

const SearchStateContext = React.createContext<SearchStateContextValue>(defaultSearchStateContext);
const SearchActionsContext = React.createContext<SearchActionsContextValue>(defaultSearchActionsContext);

function SearchContextProvider({children, params}: SearchContextProps) {
    const areTransactionsEmpty = useRef(true);

    const [lastSearchType, setLastSearchType] = useState<string>();
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [shouldShowSelectAllMatchingItems, setShouldShowSelectAllMatchingItems] = useState(false);
    const [searchContextData, setSearchContextData] = useState({...defaultSearchContextData});

    const selectedReports = searchContextData.selectedReports;
    const selectedTransactions = searchContextData.selectedTransactions;
    const selectedTransactionIDs = searchContextData.selectedTransactionIDs;
    const currentSearchHash = searchContextData.currentSearchQueryJSON?.hash ?? -1;
    const currentRecentSearchHash = searchContextData.currentSearchQueryJSON?.recentSearchHash ?? -1;
    const currentSimilarSearchHash = searchContextData.currentSearchQueryJSON?.similarSearchHash ?? -1;

    const todoSearchResultsData = useTodos();
    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`);

    const {defaultCardFeed} = useCardFeedsForDisplay();
    const {accountID} = useCurrentUserPersonalDetails();
    const suggestedSearches = getSuggestedSearches(accountID, defaultCardFeed?.id);

    const query = params?.q ?? '';
    const rawQuery = params?.rawQuery ?? '';
    const currentSearchQueryJSON = useMemo(() => {
        if (!query) {
            return undefined;
        }

        return buildSearchQueryJSON(query, rawQuery);
    }, [query, rawQuery]);

    const currentSearchKey = useMemo(() => {
        return Object.values(suggestedSearches).find((search) => search.similarSearchHash === currentSimilarSearchHash)?.key;
    }, [currentSimilarSearchHash, suggestedSearches]);

    const shouldUseLiveData = !!currentSearchKey && isTodoSearch(currentRecentSearchHash, suggestedSearches);

    // If viewing a to-do search, use live data from useTodos, otherwise return the snapshot data
    // We do this so that we can show the counters for the to-do search results without visiting the specific to-do page, e.g. show `Approve [3]` while viewing the `Submit` to-do search.
    const currentSearchResults = useMemo(() => {
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
    }, [currentSearchKey, shouldUseLiveData, snapshotSearchResults, todoSearchResultsData]);

    const setSelectedTransactions: SearchActionsContextValue['setSelectedTransactions'] = (transactionIDs, data = []) => {
        if (transactionIDs instanceof Array) {
            if (!transactionIDs.length && areTransactionsEmpty.current) {
                areTransactionsEmpty.current = true;
                return;
            }
            areTransactionsEmpty.current = false;
            return setSearchContextData((prevState) => ({
                ...prevState,
                selectedTransactionIDs: transactionIDs,
            }));
        }

        // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
        let matchingReports: SearchStateContextValue['selectedReports'] = [];

        if (data.length && data.every(isTransactionReportGroupListItemType)) {
            matchingReports = data
                .filter((item) => {
                    if (!isMoneyRequestReport(item)) {
                        return false;
                    }
                    if (item.transactions.length === 0) {
                        return !!item.keyForList && transactionIDs[item.keyForList]?.isSelected;
                    }
                    return item.transactions.every(({keyForList}) => transactionIDs[keyForList]?.isSelected);
                })
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
            matchingReports = data
                .filter(({keyForList}) => !!keyForList && transactionIDs[keyForList]?.isSelected)
                .map((item) => {
                    const total = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : (item.amount ?? CONST.DEFAULT_NUMBER_ID);
                    const action = item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;

                    return {
                        reportID: item.reportID,
                        action,
                        total,
                        policyID: item.policyID,
                        allActions: item.allActions ?? [action],
                        currency: item.currency,
                        chatReportID: item.report?.chatReportID,
                    };
                });
        }

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedReports: matchingReports,
            selectedTransactions: transactionIDs,
            shouldTurnOffSelectionMode: false,
        }));
    };

    const clearSelectedTransactions: SearchActionsContextValue['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            if (searchHashOrClearIDsFlag === currentSearchHash) {
                return;
            }

            if (selectedReports.length === 0 && isEmptyObject(selectedTransactions) && !searchContextData.shouldTurnOffSelectionMode) {
                return;
            }
            setSearchContextData((prevState) => ({
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
                selectedReports: [],
            }));

            // Unselect all transactions and hide the "select all matching items" option
            setShouldShowSelectAllMatchingItems(false);
            selectAllMatchingItems(false);
        },
        [currentSearchHash, searchContextData.shouldTurnOffSelectionMode, selectedReports.length, selectedTransactions],
    );

    const removeTransaction: SearchActionsContextValue['removeTransaction'] = (transactionID) => {
        if (!transactionID) {
            return;
        }

        if (!isEmptyObject(selectedTransactions)) {
            const newSelectedTransactions = Object.entries(selectedTransactions).reduce((acc, [key, value]) => {
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
    };

    const setShouldResetSearchQuery = (shouldReset: boolean) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            shouldResetSearchQuery: shouldReset,
        }));
    };

    const searchStateContextValue: SearchStateContextValue = {
        ...searchContextData,
        suggestedSearches,
        currentSearchKey,
        currentSearchHash,
        currentSimilarSearchHash,
        currentSearchResults,
        currentSearchQueryJSON,
        shouldUseLiveData,
        shouldShowFiltersBarLoading,
        lastSearchType,
        shouldShowSelectAllMatchingItems,
        areAllMatchingItemsSelected,
    };

    const searchActionsContextValue: SearchActionsContextValue = {
        removeTransaction,
        setSelectedTransactions,
        clearSelectedTransactions,
        setShouldShowFiltersBarLoading,
        setLastSearchType,
        setShouldShowSelectAllMatchingItems,
        selectAllMatchingItems,
        setShouldResetSearchQuery,
    };

    return (
        <SearchStateContext value={searchStateContextValue}>
            <SearchActionsContext value={searchActionsContextValue}>{children}</SearchActionsContext>
        </SearchStateContext>
    );
}

/**
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchStateContext() {
    return useContext(SearchStateContext);
}

function useSearchActionsContext() {
    return useContext(SearchActionsContext);
}

export {SearchContextProvider, useSearchStateContext, useSearchActionsContext, SearchStateContext, SearchActionsContext};
