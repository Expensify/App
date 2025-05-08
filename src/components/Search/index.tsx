import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle, ViewToken} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SearchTableHeader from '@components/SelectionList/SearchTableHeader';
import type {ReportActionListItemType, ReportListItemType, SearchListItem, TransactionListItemType} from '@components/SelectionList/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {search, updateSearchResultsWithTransactionThreadReportID} from '@libs/actions/Search';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {generateReportID} from '@libs/ReportUtils';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import {
    getListItem,
    getSections,
    getSortedSections,
    isReportActionListItemType,
    isReportListItemType,
    isSearchDataLoaded,
    isSearchResultsEmpty as isSearchResultsEmptyUtil,
    isTaskListItemType,
    isTransactionListItemType,
    shouldShowEmptyState,
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import {isOnHold} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SearchResults from '@src/types/onyx/SearchResults';
import {useSearchContext} from './SearchContext';
import SearchList from './SearchList';
import SearchScopeProvider from './SearchScopeProvider';
import type {SearchColumnType, SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

type SearchProps = {
    queryJSON: SearchQueryJSON;
    onSearchListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    currentSearchResults?: SearchResults;
    lastNonEmptySearchResults?: SearchResults;
};

function mapTransactionItemToSelectedEntry(item: TransactionListItemType): [string, SelectedTransactionInfo] {
    return [
        item.keyForList,
        {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: item.canHold,
            isHeld: isOnHold(item),
            canUnhold: item.canUnhold,
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: item.modifiedAmount ?? item.amount,
        },
    ];
}

function mapToTransactionItemWithSelectionInfo(item: TransactionListItemType, selectedTransactions: SelectedTransactions, canSelectMultiple: boolean, shouldAnimateInHighlight: boolean) {
    return {...item, shouldAnimateInHighlight, isSelected: selectedTransactions[item.keyForList]?.isSelected && canSelectMultiple};
}

function mapToItemWithSelectionInfo(item: SearchListItem, selectedTransactions: SelectedTransactions, canSelectMultiple: boolean, shouldAnimateInHighlight: boolean) {
    if (isTaskListItemType(item)) {
        return {
            ...item,
            shouldAnimateInHighlight,
        };
    }

    if (isReportActionListItemType(item)) {
        return {
            ...item,
            shouldAnimateInHighlight,
        };
    }

    return isTransactionListItemType(item)
        ? mapToTransactionItemWithSelectionInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)
        : {
              ...item,
              shouldAnimateInHighlight,
              transactions: item.transactions?.map((transaction) => mapToTransactionItemWithSelectionInfo(transaction, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)),
              isSelected: item.transactions.length > 0 && item.transactions?.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected && canSelectMultiple),
          };
}

function prepareTransactionsList(item: TransactionListItemType, selectedTransactions: SelectedTransactions) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    return {
        ...selectedTransactions,
        [item.keyForList]: {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: item.canHold,
            isHeld: isOnHold(item),
            canUnhold: item.canUnhold,
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: Math.abs(item.modifiedAmount || item.amount),
        },
    };
}

function Search({queryJSON, currentSearchResults, lastNonEmptySearchResults, onSearchListScroll, contentContainerStyle}: SearchProps) {
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for enabling the selection mode on small screens only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const isFocused = useIsFocused();
    const {
        setCurrentSearchHash,
        setSelectedTransactions,
        selectedTransactions,
        clearSelectedTransactions,
        shouldTurnOffSelectionMode,
        setShouldShowStatusBarLoading,
        lastSearchType,
        setShouldShowExportModeOption,
        isExportMode,
        setExportMode,
    } = useSearchContext();
    const {selectionMode} = useMobileSelectionMode();
    const [offset, setOffset] = useState(0);

    const {type, status, sortBy, sortOrder, hash, groupBy} = queryJSON;

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});
    const previousReportActions = usePrevious(reportActions);
    const {translate} = useLocalize();
    const shouldGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;

    const {canUseTableReportView} = usePermissions();

    useEffect(() => {
        clearSelectedTransactions(hash);
        setCurrentSearchHash(hash);
    }, [hash, clearSelectedTransactions, setCurrentSearchHash]);

    const searchResults = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults;
    const isSearchResultsEmpty = !searchResults?.data || isSearchResultsEmptyUtil(searchResults);

    useEffect(() => {
        const selectedKeys = Object.keys(selectedTransactions).filter((key) => selectedTransactions[key]);
        if (selectedKeys.length === 0 && selectionMode?.isEnabled && shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
    }, [selectedTransactions, selectionMode?.isEnabled, shouldTurnOffSelectionMode]);

    useEffect(() => {
        const selectedKeys = Object.keys(selectedTransactions).filter((key) => selectedTransactions[key]);
        if (!isSmallScreenWidth) {
            if (selectedKeys.length === 0) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (selectedKeys.length > 0 && !selectionMode?.isEnabled && !isSearchResultsEmpty) {
            turnOnMobileSelectionMode();
        }

        // We don't need to run the effect on change of isSearchResultsEmpty.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth, selectedTransactions, selectionMode?.isEnabled]);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        search({queryJSON, offset});
    }, [isOffline, offset, queryJSON]);

    const {newSearchResultKey, handleSelectionListScroll} = useSearchHighlightAndScroll({
        searchResults,
        transactions,
        previousTransactions,
        queryJSON,
        offset,
        reportActions,
        previousReportActions,
    });

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = isSearchDataLoaded(currentSearchResults, lastNonEmptySearchResults, queryJSON);

    const shouldShowLoadingState = !isOffline && !isDataLoaded;
    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;
    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    const data = useMemo(() => {
        if (searchResults === undefined) {
            return [];
        }
        return getSections(type, status, searchResults.data, searchResults.search, shouldGroupByReports);
    }, [searchResults, type, status, shouldGroupByReports]);

    useEffect(() => {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowStatusBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowStatusBarLoading, shouldShowLoadingState, type]);

    // When new data load, selectedTransactions is updated in next effect. We use this flag to whether selection is updated
    const isRefreshingSelection = useRef(false);

    useEffect(() => {
        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        const newTransactionList: SelectedTransactions = {};
        if (!shouldGroupByReports) {
            data.forEach((transaction) => {
                if (!Object.hasOwn(transaction, 'transactionID') || !('transactionID' in transaction)) {
                    return;
                }
                if (!Object.keys(selectedTransactions).includes(transaction.transactionID) && !isExportMode) {
                    return;
                }
                newTransactionList[transaction.transactionID] = {
                    action: transaction.action,
                    canHold: transaction.canHold,
                    isHeld: isOnHold(transaction),
                    canUnhold: transaction.canUnhold,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isSelected: isExportMode || selectedTransactions[transaction.transactionID].isSelected,
                    canDelete: transaction.canDelete,
                    reportID: transaction.reportID,
                    policyID: transaction.policyID,
                    amount: transaction.modifiedAmount ?? transaction.amount,
                };
            });
        } else {
            data.forEach((report) => {
                if (!Object.hasOwn(report, 'transactions') || !('transactions' in report)) {
                    return;
                }
                report.transactions.forEach((transaction) => {
                    if (!Object.keys(selectedTransactions).includes(transaction.transactionID) && !isExportMode) {
                        return;
                    }
                    newTransactionList[transaction.transactionID] = {
                        action: transaction.action,
                        canHold: transaction.canHold,
                        isHeld: isOnHold(transaction),
                        canUnhold: transaction.canUnhold,
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isSelected: isExportMode || selectedTransactions[transaction.transactionID].isSelected,
                        canDelete: transaction.canDelete,
                        reportID: transaction.reportID,
                        policyID: transaction.policyID,
                        amount: transaction.modifiedAmount ?? transaction.amount,
                    };
                });
            });
        }
        setSelectedTransactions(newTransactionList, data);

        isRefreshingSelection.current = true;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [data, setSelectedTransactions, isExportMode]);

    useEffect(() => {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);

    useEffect(
        () => () => {
            if (isSearchTopmostFullScreenRoute()) {
                return;
            }
            clearSelectedTransactions();
            turnOffMobileSelectionMode();
        },
        [isFocused, clearSelectedTransactions],
    );

    // When selectedTransactions is updated, we confirm that selection is refreshed
    useEffect(() => {
        isRefreshingSelection.current = false;
    }, [selectedTransactions]);

    useEffect(() => {
        if (!data.length || isRefreshingSelection.current || !isFocused) {
            return;
        }
        const areItemsOfReportType = shouldGroupByReports;
        const flattenedItems = areItemsOfReportType ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
        const isAllSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        setShouldShowExportModeOption(!!(isAllSelected && searchResults?.search?.hasMoreResults));
        if (!isAllSelected) {
            setExportMode(false);
        }
    }, [isFocused, data, searchResults?.search?.hasMoreResults, selectedTransactions, setExportMode, setShouldShowExportModeOption, shouldGroupByReports]);

    const toggleTransaction = useCallback(
        (item: SearchListItem) => {
            if (isReportActionListItemType(item)) {
                return;
            }
            if (isTaskListItemType(item)) {
                return;
            }
            if (isTransactionListItemType(item)) {
                if (!item.keyForList) {
                    return;
                }

                setSelectedTransactions(prepareTransactionsList(item, selectedTransactions), data);
                return;
            }

            if (item.transactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};

                item.transactions.forEach((transaction) => {
                    delete reducedSelectedTransactions[transaction.keyForList];
                });

                setSelectedTransactions(reducedSelectedTransactions, data);
                return;
            }

            setSelectedTransactions(
                {
                    ...selectedTransactions,
                    ...Object.fromEntries(item.transactions.map(mapTransactionItemToSelectedEntry)),
                },
                data,
            );
        },
        [data, selectedTransactions, setSelectedTransactions],
    );

    const openReport = useCallback(
        (item: SearchListItem, isOpenedAsReport?: boolean) => {
            if (selectionMode?.isEnabled) {
                toggleTransaction(item);
                return;
            }

            const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            const isTransactionItem = isTransactionListItemType(item);

            let reportID =
                isTransactionItem && (!item.isFromOneTransactionReport || isFromSelfDM) && item.transactionThreadReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                    ? item.transactionThreadReportID
                    : item.reportID;

            if (!reportID) {
                return;
            }

            const backTo = Navigation.getActiveRoute();
            const shouldHandleTransactionAsReport = isReportListItemType(item) || (isTransactionItem && isOpenedAsReport);

            if (canUseTableReportView && shouldHandleTransactionAsReport) {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo}));
                return;
            }

            // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionItem && reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                reportID = generateReportID();
                updateSearchResultsWithTransactionThreadReportID(hash, item.transactionID, reportID);
                Navigation.navigate(
                    ROUTES.SEARCH_REPORT.getRoute({
                        reportID,
                        backTo,
                        moneyRequestReportActionID: item.moneyRequestReportActionID,
                        transactionID: item.transactionID,
                    }),
                );
                return;
            }

            if (isReportActionListItemType(item)) {
                const reportActionID = item.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        },
        [canUseTableReportView, hash, selectionMode?.isEnabled, toggleTransaction],
    );

    const onViewableItemsChanged = useCallback(
        ({viewableItems}: {viewableItems: ViewToken[]}) => {
            const isFirstItemVisible = viewableItems.at(0)?.index === 1;
            // If the user is still loading the search results, or if they are scrolling down, don't refresh the search results
            if (shouldShowLoadingState || !isFirstItemVisible) {
                return;
            }

            // This line makes sure the app refreshes the search results when the user scrolls to the top.
            // The backend sends items in parts based on the offset, with a limit on the number of items sent (pagination).
            // As a result, it skips some items, for example, if the offset is 100, it sends the next items without the first ones.
            // Therefore, when the user scrolls to the top, we need to refresh the search results.
            setOffset(0);
        },
        [shouldShowLoadingState],
    );

    if (shouldShowLoadingState) {
        return (
            <SearchRowSkeleton
                shouldAnimate
                containerStyle={shouldUseNarrowLayout && styles.searchListContentContainerStyles}
            />
        );
    }

    if (searchResults === undefined) {
        Log.alert('[Search] Undefined search type');
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    const ListItem = getListItem(type, status, shouldGroupByReports);
    const sortedData = getSortedSections(type, status, data, sortBy, sortOrder, shouldGroupByReports);

    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
    const canSelectMultiple = !isChat && !isTask && (!isSmallScreenWidth || selectionMode?.isEnabled === true);

    const sortedSelectedData = sortedData.map((item) => {
        const baseKey = isChat
            ? `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${(item as ReportActionListItemType).reportActionID}`
            : `${ONYXKEYS.COLLECTION.TRANSACTION}${(item as TransactionListItemType).transactionID}`;
        // Check if the base key matches the newSearchResultKey (TransactionListItemType)
        const isBaseKeyMatch = baseKey === newSearchResultKey;
        // Check if any transaction within the transactions array (ReportListItemType) matches the newSearchResultKey
        const isAnyTransactionMatch =
            !isChat &&
            (item as ReportListItemType)?.transactions?.some((transaction) => {
                const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                return transactionKey === newSearchResultKey;
            });
        // Determine if either the base key or any transaction key matches
        const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;

        return mapToItemWithSelectionInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight);
    });

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    if (hasErrors) {
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <FullPageErrorView
                    shouldShow
                    subtitleStyle={styles.textSupporting}
                    title={translate('errorPage.title', {isBreakLine: !!shouldUseNarrowLayout})}
                    subtitle={translate('errorPage.subtitle')}
                />
            </View>
        );
    }

    if (shouldShowEmptyState(isDataLoaded, data.length, searchResults.search.type)) {
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <EmptySearchView
                    type={type}
                    hasResults={searchResults.search.hasResults}
                />
            </View>
        );
    }

    const fetchMoreResults = () => {
        if (!searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        setOffset(offset + CONST.SEARCH.RESULTS_PAGE_SIZE);
    };

    const toggleAllTransactions = () => {
        const areItemsOfReportType = shouldGroupByReports;
        const totalSelected = Object.keys(selectedTransactions).length;

        if (totalSelected > 0) {
            clearSelectedTransactions();
            return;
        }

        if (areItemsOfReportType) {
            setSelectedTransactions(Object.fromEntries((data as ReportListItemType[]).flatMap((item) => item.transactions.map(mapTransactionItemToSelectedEntry))), data);

            return;
        }

        setSelectedTransactions(Object.fromEntries((data as TransactionListItemType[]).map(mapTransactionItemToSelectedEntry)), data);
    };

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        const newQuery = buildSearchQueryString({...queryJSON, sortBy: column, sortOrder: order});
        navigation.setParams({q: newQuery});
    };

    const shouldShowYear = shouldShowYearUtil(searchResults?.data);
    const shouldShowSorting = !Array.isArray(status) && !shouldGroupByReports;
    const shouldShowTableHeader = isLargeScreenWidth && !isChat;

    return (
        <SearchScopeProvider isOnSearch>
            <SearchList
                ref={handleSelectionListScroll(sortedSelectedData)}
                data={sortedSelectedData}
                ListItem={ListItem}
                onSelectRow={openReport}
                onCheckboxPress={toggleTransaction}
                onAllCheckboxPress={toggleAllTransactions}
                canSelectMultiple={canSelectMultiple}
                shouldPreventLongPressRow={isChat || isTask}
                SearchTableHeader={
                    !shouldShowTableHeader ? undefined : (
                        <SearchTableHeader
                            canSelectMultiple={canSelectMultiple}
                            data={searchResults?.data}
                            metadata={searchResults?.search}
                            onSortPress={onSortPress}
                            sortOrder={sortOrder}
                            sortBy={sortBy}
                            shouldShowYear={shouldShowYear}
                            shouldShowSorting={shouldShowSorting}
                        />
                    )
                }
                contentContainerStyle={[contentContainerStyle, styles.pb3]}
                containerStyle={[styles.pv0, type === CONST.SEARCH.DATA_TYPES.CHAT && !isSmallScreenWidth && styles.pt3]}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                shouldGroupByReports={shouldGroupByReports}
                onScroll={onSearchListScroll}
                onEndReachedThreshold={0.75}
                onEndReached={fetchMoreResults}
                ListFooterComponent={
                    shouldShowLoadingMoreItems ? (
                        <SearchRowSkeleton
                            shouldAnimate
                            fixedNumItems={5}
                        />
                    ) : undefined
                }
                queryJSONHash={hash}
                onViewableItemsChanged={onViewableItemsChanged}
            />
        </SearchScopeProvider>
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
