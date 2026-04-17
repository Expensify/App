import {useNavigation} from '@react-navigation/core';
import type {NavigationState} from '@react-navigation/routers';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
// We need direct access to useOnyx from react-native-onyx to avoid circular dependencies in SearchContext
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useTodos from '@hooks/useTodos';
import {getDeepestFocusedScreen} from '@libs/Navigation/Navigation';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSuggestedSearches, isTodoSearch, isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchActionsContextValue, SearchContextData, SearchStateContextValue, SelectedTransactions} from './types';

type SearchContextProps = {
    children: React.ReactNode;
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
    shouldShowFiltersBarLoading: false,
    currentSearchResults: undefined,
    shouldUseLiveData: false,
};

const defaultSearchActionsContext: SearchActionsContextValue = {
    setLastSearchType: () => {},
    setCurrentSelectedTransactionReportID: () => {},
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

function selectSearchQueryParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.q as string | undefined) : undefined;
}

function selectSearchRawQueryParam(state: NavigationState | undefined) {
    const focused = getDeepestFocusedScreen(state);
    return focused?.name === SCREENS.SEARCH.ROOT ? (focused.params?.rawQuery as string | undefined) : undefined;
}

function SearchContextProvider({children}: SearchContextProps) {
    const navigation = useNavigation();
    // Extract only the primitive values we need from the focused screen to avoid
    // re-renders from new object references returned by getDeepestFocusedScreen.
    const queryParam = useRootNavigationState((state) => selectSearchQueryParam(state ?? navigation.getState()));
    const rawQueryParam = useRootNavigationState((state) => selectSearchRawQueryParam(state ?? navigation.getState()));
    const definedQueryParam = usePreviousDefined(queryParam) ?? buildSearchQueryString();
    const currentSearchQueryJSON = useMemo(() => buildSearchQueryJSON(definedQueryParam, rawQueryParam), [definedQueryParam, rawQueryParam]);

    const areTransactionsEmpty = useRef(true);
    const [lastSearchType, setLastSearchType] = useState<string>();
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading] = useState(false);
    const [shouldShowSelectAllMatchingItems, setShouldShowSelectAllMatchingItems] = useState(false);
    const [searchContextData, setSearchContextData] = useState({...defaultSearchContextData});

    const currentSearchHash = currentSearchQueryJSON?.hash ?? -1;
    const currentRecentSearchHash = currentSearchQueryJSON?.recentSearchHash ?? -1;
    const currentSimilarSearchHash = currentSearchQueryJSON?.similarSearchHash ?? -1;

    const todoSearchResultsData = useTodos();
    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`);

    const {defaultCardFeed} = useCardFeedsForDisplay();
    const {accountID} = useCurrentUserPersonalDetails();
    const defaultCardFeedID = defaultCardFeed?.id;
    const suggestedSearches = useMemo(() => getSuggestedSearches(accountID, defaultCardFeedID), [accountID, defaultCardFeedID]);

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

    const setSelectedTransactions: SearchActionsContextValue['setSelectedTransactions'] = useCallback((transactionIDs, data = []) => {
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
                .map(
                    ({
                        reportID,
                        action = CONST.SEARCH.ACTION_TYPES.VIEW,
                        total = CONST.DEFAULT_NUMBER_ID,
                        policyID,
                        allActions = [action],
                        currency,
                        chatReportID,
                        managerID,
                        ownerAccountID,
                        parentReportActionID,
                        parentReportID,
                    }) => ({
                        reportID,
                        action,
                        total,
                        policyID,
                        allActions,
                        currency,
                        chatReportID,
                        managerID,
                        ownerAccountID,
                        parentReportActionID,
                        parentReportID,
                    }),
                );
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
                        managerID: item.report?.managerID,
                        ownerAccountID: item.report?.ownerAccountID,
                        parentReportActionID: item.report?.parentReportActionID,
                        parentReportID: item.report?.parentReportID,
                        type: item.report?.type,
                    };
                });
        }

        setSearchContextData((prevState) => ({
            ...prevState,
            selectedReports: matchingReports,
            selectedTransactions: transactionIDs,
            shouldTurnOffSelectionMode: false,
        }));
    }, []);

    const currentSearchHashRef = useRef(currentSearchHash);
    useEffect(() => {
        currentSearchHashRef.current = currentSearchHash;
    }, [currentSearchHash]);

    const setCurrentSelectedTransactionReportID: SearchActionsContextValue['setCurrentSelectedTransactionReportID'] = (reportID) => {
        setSearchContextData((prevState) => {
            if (reportID === prevState.currentSelectedTransactionReportID) {
                return prevState;
            }

            return {
                ...prevState,
                currentSelectedTransactionReportID: reportID,
            };
        });
    };

    const clearSelectedTransactions: SearchActionsContextValue['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            if (searchHashOrClearIDsFlag === currentSearchHashRef.current) {
                return;
            }

            setSearchContextData((prevState) => {
                if (prevState.selectedReports.length === 0 && isEmptyObject(prevState.selectedTransactions) && !prevState.shouldTurnOffSelectionMode) {
                    return prevState;
                }
                return {
                    ...prevState,
                    shouldTurnOffSelectionMode,
                    selectedTransactions: {},
                    selectedReports: [],
                };
            });

            setShouldShowSelectAllMatchingItems(false);
            selectAllMatchingItems(false);
        },
        // currentSearchHash is read via currentSearchHashRef to keep this callback stable.
        // setShouldShowSelectAllMatchingItems and selectAllMatchingItems are stable useState setters.
        [setSelectedTransactions],
    );

    const removeTransaction: SearchActionsContextValue['removeTransaction'] = useCallback((transactionID) => {
        if (!transactionID) {
            return;
        }

        setSearchContextData((prevState) => {
            const hasSelectedTransactions = !isEmptyObject(prevState.selectedTransactions);
            const hasSelectedIDs = prevState.selectedTransactionIDs.length > 0;

            if (!hasSelectedTransactions && !hasSelectedIDs) {
                return prevState;
            }

            const newState = {...prevState};
            if (hasSelectedTransactions) {
                const newSelectedTransactions = Object.entries(prevState.selectedTransactions).reduce((acc, [key, value]) => {
                    if (key === transactionID) {
                        return acc;
                    }
                    acc[key] = value;
                    return acc;
                }, {} as SelectedTransactions);
                newState.selectedTransactions = newSelectedTransactions;
            }
            if (hasSelectedIDs) {
                newState.selectedTransactionIDs = prevState.selectedTransactionIDs.filter((ID) => transactionID !== ID);
            }
            return newState;
        });
    }, []);

    const setShouldResetSearchQuery = useCallback((shouldReset: boolean) => {
        setSearchContextData((prevState) => ({
            ...prevState,
            shouldResetSearchQuery: shouldReset,
        }));
    }, []);

    const searchStateContextValue: SearchStateContextValue = useMemo(
        () => ({
            ...searchContextData,
            suggestedSearches,
            currentSearchKey,
            currentSearchHash,
            currentSimilarSearchHash,
            currentSearchResults,
            shouldUseLiveData,
            shouldShowFiltersBarLoading,
            lastSearchType,
            shouldShowSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            currentSearchQueryJSON,
        }),
        [
            searchContextData,
            suggestedSearches,
            currentSearchKey,
            currentSearchHash,
            currentSimilarSearchHash,
            currentSearchResults,
            shouldUseLiveData,
            shouldShowFiltersBarLoading,
            lastSearchType,
            shouldShowSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            currentSearchQueryJSON,
        ],
    );

    const searchActionsContextValue: SearchActionsContextValue = useMemo(
        () => ({
            removeTransaction,
            setSelectedTransactions,
            setCurrentSelectedTransactionReportID,
            clearSelectedTransactions,
            setShouldShowFiltersBarLoading,
            setLastSearchType,
            setShouldShowSelectAllMatchingItems,
            selectAllMatchingItems,
            setShouldResetSearchQuery,
        }),
        // shouldShowFiltersBarLoading, setLastSearchType, setShouldShowSelectAllMatchingItems,
        // and selectAllMatchingItems are stable useState setters — excluded from deps intentionally.
        // setCurrentSelectedTransactionReportID only uses setSearchContextData (stable setter).
        [removeTransaction, setSelectedTransactions, clearSelectedTransactions, setShouldResetSearchQuery],
    );

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
