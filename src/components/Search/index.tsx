import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import SearchTableHeader from '@components/SelectionList/SearchTableHeader';
import type {ReportActionListItemType, ReportListItemType, SelectionListHandle, TransactionListItemType} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import SearchStatusSkeleton from '@components/Skeletons/SearchStatusSkeleton';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import memoize from '@libs/memoize';
import * as ReportUtils from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SearchResults from '@src/types/onyx/SearchResults';
import {useSearchContext} from './SearchContext';
import SearchPageHeader from './SearchPageHeader';
import SearchStatusBar from './SearchStatusBar';
import type {SearchColumnType, SearchQueryJSON, SearchStatus, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';
import useTriggerSearchOnNewTransaction from '@hooks/useTriggerSearchOnTransactionIncrease';
import useNewSearchResultKey from '@hooks/useNewSearchResultKey';

type SearchProps = {
    queryJSON: SearchQueryJSON;
};

const transactionItemMobileHeight = 100;
const reportItemTransactionHeight = 52;
const listItemPadding = 12; // this is equivalent to 'mb3' on every transaction/report list item
const searchHeaderHeight = 54;
const sortableSearchStatuses: SearchStatus[] = [CONST.SEARCH.STATUS.EXPENSE.ALL];

function mapTransactionItemToSelectedEntry(item: TransactionListItemType): [string, SelectedTransactionInfo] {
    return [item.keyForList, {isSelected: true, canDelete: item.canDelete, canHold: item.canHold, canUnhold: item.canUnhold, action: item.action}];
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
    if (SearchUtils.isReportActionListItemType(item)) {
        return item;
    }

    return SearchUtils.isTransactionListItemType(item)
        ? mapToTransactionItemWithSelectionInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)
        : {
              ...item,
              shouldAnimateInHighlight,
              transactions: item.transactions?.map((transaction) => mapToTransactionItemWithSelectionInfo(transaction, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)),
              isSelected: item.transactions.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected && canSelectMultiple),
          };
}

function prepareTransactionsList(item: TransactionListItemType, selectedTransactions: SelectedTransactions) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    return {...selectedTransactions, [item.keyForList]: {isSelected: true, canDelete: item.canDelete, canHold: item.canHold, canUnhold: item.canUnhold, action: item.action}};
}

function Search({queryJSON}: SearchProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const navigation = useNavigation<StackNavigationProp<AuthScreensParamList>>();
    const lastSearchResultsRef = useRef<OnyxEntry<SearchResults>>();
    const {setCurrentSearchHash, setSelectedTransactions, selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const {selectionMode} = useMobileSelectionMode();
    const [offset, setOffset] = useState(0);
    const [offlineModalVisible, setOfflineModalVisible] = useState(false);

    const [selectedTransactionsToDelete, setSelectedTransactionsToDelete] = useState<string[]>([]);
    const [deleteExpensesConfirmModalVisible, setDeleteExpensesConfirmModalVisible] = useState(false);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const {type, status, sortBy, sortOrder, hash} = queryJSON;

    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const previousTransactions = usePrevious(transactions);

    const canSelectMultiple = isSmallScreenWidth ? !!selectionMode?.isEnabled : true;

    useEffect(() => {
        clearSelectedTransactions(hash);
        setCurrentSearchHash(hash);
    }, [hash, clearSelectedTransactions, setCurrentSearchHash]);

    useEffect(() => {
        const selectedKeys = Object.keys(selectedTransactions).filter((key) => selectedTransactions[key]);
        if (!isSmallScreenWidth) {
            if (selectedKeys.length === 0) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (selectedKeys.length > 0 && !selectionMode?.isEnabled) {
            turnOnMobileSelectionMode();
        }
    }, [isSmallScreenWidth, selectedTransactions, selectionMode?.isEnabled]);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search({queryJSON, offset});
    }, [isOffline, offset, queryJSON]);

    useTriggerSearchOnNewTransaction({transactions, previousTransactions, queryJSON, offset});

    const handleOnCancelConfirmModal = () => {
        setDeleteExpensesConfirmModalVisible(false);
    };

    const handleDeleteExpenses = () => {
        if (selectedTransactionsToDelete.length === 0) {
            return;
        }

        clearSelectedTransactions();
        setDeleteExpensesConfirmModalVisible(false);
        SearchActions.deleteMoneyRequestOnSearch(hash, selectedTransactionsToDelete);
    };

    const handleOnSelectDeleteOption = (itemsToDelete: string[]) => {
        setSelectedTransactionsToDelete(itemsToDelete);
        setDeleteExpensesConfirmModalVisible(true);
    };

    const getItemHeight = useCallback(
        (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
            if (SearchUtils.isTransactionListItemType(item) || SearchUtils.isReportActionListItemType(item)) {
                return isLargeScreenWidth ? variables.optionRowHeight + listItemPadding : transactionItemMobileHeight + listItemPadding;
            }

            if (item.transactions.length === 0) {
                return 0;
            }

            if (item.transactions.length === 1) {
                return isLargeScreenWidth ? variables.optionRowHeight + listItemPadding : transactionItemMobileHeight + listItemPadding;
            }

            const baseReportItemHeight = isLargeScreenWidth ? 72 : 108;
            return baseReportItemHeight + item.transactions.length * reportItemTransactionHeight + listItemPadding;
        },
        [isLargeScreenWidth],
    );

    const resetOffset = () => setOffset(0);

    const getItemHeightMemoized = memoize(getItemHeight, {
        transformKey: ([item]) => {
            // List items are displayed differently on "L"arge and "N"arrow screens so the height will differ
            // in addition the same items might be displayed as part of different Search screens ("Expenses", "All", "Finished")
            const screenSizeHash = isLargeScreenWidth ? 'L' : 'N';
            return `${hash}-${item.keyForList}-${screenSizeHash}`;
        },
    });

    // save last non-empty search results to avoid ugly flash of loading screen when hash changes and onyx returns empty data
    if (currentSearchResults?.data && currentSearchResults !== lastSearchResultsRef.current) {
        lastSearchResultsRef.current = currentSearchResults;
    }

    const searchResults = currentSearchResults?.data ? currentSearchResults : lastSearchResultsRef.current;
    const newSearchResultKey = useNewSearchResultKey(searchResults);

    const handleSelectionListScroll = useCallback(
        (data: Array<TransactionListItemType | ReportActionListItemType | ReportListItemType>) => (ref: SelectionListHandle | null) => {
            const indexOfNewTransaction = data?.findIndex(
                (transaction) => `${ONYXKEYS.COLLECTION.TRANSACTION}${(transaction as TransactionListItemType)?.transactionID}` === newSearchResultKey,
            );

            if (!ref || indexOfNewTransaction < 0) {
                return;
            }

            ref?.scrollToIndex(indexOfNewTransaction);
        },
        [newSearchResultKey],
    );

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = searchResults?.data !== undefined && searchResults?.search?.type === type && searchResults?.search?.status === status;
    const shouldShowLoadingState = !isOffline && !isDataLoaded;
    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;
    const isSearchResultsEmpty = !searchResults?.data || SearchUtils.isSearchResultsEmpty(searchResults);
    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    useEffect(() => {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);

    if (shouldShowLoadingState) {
        return (
            <>
                <SearchPageHeader
                    queryJSON={queryJSON}
                    hash={hash}
                />

                {/* We only want to display the skeleton for the status filters the first time we load them for a specific data type */}
                {searchResults?.search?.type === type ? (
                    <SearchStatusBar
                        type={type}
                        status={status}
                        resetOffset={resetOffset}
                    />
                ) : (
                    <SearchStatusSkeleton shouldAnimate />
                )}
                <SearchRowSkeleton shouldAnimate />
            </>
        );
    }

    if (searchResults === undefined) {
        Log.alert('[Search] Undefined search type');
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    const ListItem = SearchUtils.getListItem(type, status);
    const data = SearchUtils.getSections(type, status, searchResults.data, searchResults.search);
    const sortedData = SearchUtils.getSortedSections(type, status, data, sortBy, sortOrder);
    const sortedSelectedData = sortedData.map((item) => {
        const baseKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${(item as TransactionListItemType).transactionID}`;
        // Check if the base key matches the newSearchResultKey (TransactionListItemType)
        const isBaseKeyMatch = baseKey === newSearchResultKey;
        // Check if any transaction within the transactions array (ReportListItemType) matches the newSearchResultKey
        const isAnyTransactionMatch = (item as ReportListItemType)?.transactions?.some((transaction) => {
            const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
            return transactionKey === newSearchResultKey;
        });
        // Determine if either the base key or any transaction key matches
        const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;
        
        return mapToItemWithSelectionInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight);
    });

    const shouldShowEmptyState = !isDataLoaded || data.length === 0;

    if (shouldShowEmptyState) {
        return (
            <>
                <SearchPageHeader
                    queryJSON={queryJSON}
                    hash={hash}
                />
                <SearchStatusBar
                    type={type}
                    status={status}
                    resetOffset={resetOffset}
                />
                <EmptySearchView type={type} />
            </>
        );
    }

    const toggleTransaction = (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
        if (SearchUtils.isReportActionListItemType(item)) {
            return;
        }
        if (SearchUtils.isTransactionListItemType(item)) {
            if (!item.keyForList) {
                return;
            }

            setSelectedTransactions(prepareTransactionsList(item, selectedTransactions));
            return;
        }

        if (item.transactions.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
            const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};

            item.transactions.forEach((transaction) => {
                delete reducedSelectedTransactions[transaction.keyForList];
            });

            setSelectedTransactions(reducedSelectedTransactions);
            return;
        }

        setSelectedTransactions({
            ...selectedTransactions,
            ...Object.fromEntries(item.transactions.map(mapTransactionItemToSelectedEntry)),
        });
    };

    const openReport = (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
        const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORTID;
        let reportID = SearchUtils.isTransactionListItemType(item) && (!item.isFromOneTransactionReport || isFromSelfDM) ? item.transactionThreadReportID : item.reportID;

        if (!reportID) {
            return;
        }

        // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
        if (SearchUtils.isTransactionListItemType(item) && reportID === '0' && item.moneyRequestReportActionID) {
            reportID = ReportUtils.generateReportID();
            SearchActions.createTransactionThread(hash, item.transactionID, reportID, item.moneyRequestReportActionID);
        }

        if (SearchUtils.isReportActionListItemType(item)) {
            const reportActionID = item.reportActionID;
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(reportID, reportActionID));
            return;
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(reportID));
    };

    const fetchMoreResults = () => {
        if (!searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        setOffset(offset + CONST.SEARCH.RESULTS_PAGE_SIZE);
    };

    const toggleAllTransactions = () => {
        const areItemsOfReportType = status !== CONST.SEARCH.STATUS.EXPENSE.ALL;
        const flattenedItems = areItemsOfReportType ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
        const isAllSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        if (isAllSelected) {
            clearSelectedTransactions();
            return;
        }

        if (areItemsOfReportType) {
            setSelectedTransactions(Object.fromEntries((data as ReportListItemType[]).flatMap((item) => item.transactions.map(mapTransactionItemToSelectedEntry))));

            return;
        }

        setSelectedTransactions(Object.fromEntries((data as TransactionListItemType[]).map(mapTransactionItemToSelectedEntry)));
    };

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        const newQuery = SearchUtils.buildSearchQueryString({...queryJSON, sortBy: column, sortOrder: order});
        navigation.setParams({q: newQuery});
    };

    const shouldShowYear = SearchUtils.shouldShowYear(searchResults?.data);
    const shouldShowSorting = sortableSearchStatuses.includes(status);

    return (
        <>
            <SearchPageHeader
                queryJSON={queryJSON}
                hash={hash}
                onSelectDeleteOption={handleOnSelectDeleteOption}
                data={data}
                setOfflineModalOpen={() => setOfflineModalVisible(true)}
                setDownloadErrorModalOpen={() => setDownloadErrorModalVisible(true)}
            />
            <SearchStatusBar
                type={type}
                status={status}
                resetOffset={resetOffset}
            />
            <SelectionListWithModal<ReportListItemType | TransactionListItemType | ReportActionListItemType>
                ref={handleSelectionListScroll(sortedSelectedData)}
                sections={[{data: sortedSelectedData, isDisabled: false}]}
                turnOnSelectionModeOnLongPress={type !== CONST.SEARCH.DATA_TYPES.CHAT}
                onTurnOnSelectionMode={(item) => item && toggleTransaction(item)}
                onCheckboxPress={toggleTransaction}
                onSelectAll={toggleAllTransactions}
                customListHeader={
                    !isLargeScreenWidth ? null : (
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
                canSelectMultiple={type !== CONST.SEARCH.DATA_TYPES.CHAT && canSelectMultiple}
                customListHeaderHeight={searchHeaderHeight}
                // To enhance the smoothness of scrolling and minimize the risk of encountering blank spaces during scrolling,
                // we have configured a larger windowSize and a longer delay between batch renders.
                // The windowSize determines the number of items rendered before and after the currently visible items.
                // A larger windowSize helps pre-render more items, reducing the likelihood of blank spaces appearing.
                // The updateCellsBatchingPeriod sets the delay (in milliseconds) between rendering batches of cells.
                // A longer delay allows the UI to handle rendering in smaller increments, which can improve performance and smoothness.
                // For more information, refer to the React Native documentation:
                // https://reactnative.dev/docs/0.73/optimizing-flatlist-configuration#windowsize
                // https://reactnative.dev/docs/0.73/optimizing-flatlist-configuration#updatecellsbatchingperiod
                windowSize={111}
                updateCellsBatchingPeriod={200}
                ListItem={ListItem}
                onSelectRow={openReport}
                getItemHeight={getItemHeightMemoized}
                shouldSingleExecuteRowSelect
                shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                listHeaderWrapperStyle={[styles.ph8, styles.pv3, styles.pb5]}
                containerStyle={[styles.pv0]}
                showScrollIndicator={false}
                onEndReachedThreshold={0.75}
                onEndReached={fetchMoreResults}
                listFooterContent={
                    shouldShowLoadingMoreItems ? (
                        <SearchRowSkeleton
                            shouldAnimate
                            fixedNumItems={5}
                        />
                    ) : undefined
                }
            />
            <ConfirmModal
                isVisible={deleteExpensesConfirmModalVisible}
                onConfirm={handleDeleteExpenses}
                onCancel={handleOnCancelConfirmModal}
                onModalHide={() => setSelectedTransactionsToDelete([])}
                title={translate('iou.deleteExpense', {count: selectedTransactionsToDelete.length})}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsToDelete.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
        </>
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
