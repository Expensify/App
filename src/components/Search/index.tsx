import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SearchTableHeader from '@components/SelectionList/SearchTableHeader';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
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
    isSearchResultsEmpty as isSearchResultsEmptyUtil,
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

function mapToItemWithSelectionInfo(
    item: TransactionListItemType | ReportListItemType | ReportActionListItemType,
    selectedTransactions: SelectedTransactions,
    canSelectMultiple: boolean,
    shouldAnimateInHighlight: boolean,
) {
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
    const {setCurrentSearchHash, setSelectedTransactions, selectedTransactions, clearSelectedTransactions, shouldTurnOffSelectionMode, setShouldShowStatusBarLoading, lastSearchType} =
        useSearchContext();
    const {selectionMode} = useMobileSelectionMode();
    const [offset, setOffset] = useState(0);

    const {type, status, sortBy, sortOrder, hash, groupBy} = queryJSON;

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const previousReportActions = usePrevious(reportActions);
    const shouldGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;

    const {canUseTableReportView} = usePermissions();
    const canSelectMultiple = isSmallScreenWidth ? !!selectionMode?.isEnabled : true;

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
        // Set offset to 0 to retrieve the most recent chat messages.
        offset: 0,
        reportActions,
        previousReportActions,
    });

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded =
        searchResults?.data !== undefined && searchResults?.search?.type === type && Array.isArray(status)
            ? searchResults?.search?.status === status.join(',')
            : searchResults?.search?.status === status;

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
                if (!Object.keys(selectedTransactions).includes(transaction.transactionID)) {
                    return;
                }
                newTransactionList[transaction.transactionID] = {
                    action: transaction.action,
                    canHold: transaction.canHold,
                    isHeld: isOnHold(transaction),
                    canUnhold: transaction.canUnhold,
                    isSelected: selectedTransactions[transaction.transactionID].isSelected,
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
                    if (!Object.keys(selectedTransactions).includes(transaction.transactionID)) {
                        return;
                    }
                    newTransactionList[transaction.transactionID] = {
                        action: transaction.action,
                        canHold: transaction.canHold,
                        isHeld: isOnHold(transaction),
                        canUnhold: transaction.canUnhold,
                        isSelected: selectedTransactions[transaction.transactionID].isSelected,
                        canDelete: transaction.canDelete,
                        reportID: transaction.reportID,
                        policyID: transaction.policyID,
                        amount: transaction.modifiedAmount ?? transaction.amount,
                    };
                });
            });
        }
        setSelectedTransactions(newTransactionList, data);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [data, setSelectedTransactions]);

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

    const openReport = useCallback(
        (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
            const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORTID;
            let reportID = isTransactionListItemType(item) && (!item.isFromOneTransactionReport || isFromSelfDM) ? item.transactionThreadReportID : item.reportID;

            if (!reportID) {
                return;
            }

            const backTo = Navigation.getActiveRoute();

            // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionListItemType(item) && reportID === '0' && item.moneyRequestReportActionID) {
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

            if (canUseTableReportView && isReportListItemType(item)) {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo}));
                return;
            }

            if (isReportActionListItemType(item)) {
                const reportActionID = item.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        },
        [canUseTableReportView, hash],
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

    const toggleTransaction = (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
        if (isReportActionListItemType(item)) {
            return;
        }
        if (isTransactionListItemType(item)) {
            if (!item.keyForList) {
                return;
            }

            setSelectedTransactions(prepareTransactionsList(item, selectedTransactions), data);
            return;
        }

        if (item.transactions.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
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
    };

    const fetchMoreResults = () => {
        if (!searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        setOffset(offset + CONST.SEARCH.RESULTS_PAGE_SIZE);
    };

    const toggleAllTransactions = () => {
        const areItemsOfReportType = shouldGroupByReports;
        const flattenedItems = areItemsOfReportType ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
        const isAllSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        if (isAllSelected) {
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

    return (
        <SearchList
            ref={handleSelectionListScroll(sortedSelectedData)}
            data={sortedSelectedData}
            ListItem={ListItem}
            onSelectRow={openReport}
            onCheckboxPress={toggleTransaction}
            onAllCheckboxPress={toggleAllTransactions}
            canSelectMultiple={type !== CONST.SEARCH.DATA_TYPES.CHAT && canSelectMultiple}
            shouldPreventLongPressRow={isChat}
            SearchTableHeader={
                !isLargeScreenWidth ? undefined : (
                    <SearchTableHeader
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
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
