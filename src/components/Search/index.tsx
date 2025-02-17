import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SearchTableHeader from '@components/SelectionList/SearchTableHeader';
import type {ReportActionListItemType, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {createTransactionThread, search} from '@libs/actions/Search';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import memoize from '@libs/memoize';
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
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import {isOnHold} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SearchResults from '@src/types/onyx/SearchResults';
import {useSearchContext} from './SearchContext';
import type {SearchColumnType, SearchQueryJSON, SearchStatus, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

type SearchProps = {
    queryJSON: SearchQueryJSON;
    onSearchListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    isSearchScreenFocused?: boolean;
    onContentSizeChange?: (w: number, h: number) => void;
};

const transactionItemMobileHeight = 100;
const reportItemTransactionHeight = 52;
const listItemPadding = 12; // this is equivalent to 'mb3' on every transaction/report list item
const searchHeaderHeight = 54;
const sortableSearchStatuses: SearchStatus[] = [CONST.SEARCH.STATUS.EXPENSE.ALL];

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
              isSelected: item.transactions?.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected && canSelectMultiple),
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
function Search({queryJSON, onSearchListScroll, isSearchScreenFocused, contentContainerStyle, onContentSizeChange}: SearchProps) {
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for enabling the selection mode on small screens only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const navigation = useNavigation<PlatformStackNavigationProp<AuthScreensParamList>>();
    const isFocused = useIsFocused();
    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResults | undefined>(undefined);
    const {
        setCurrentSearchHash,
        setSelectedTransactions,
        selectedTransactions,
        clearSelectedTransactions,
        shouldTurnOffSelectionMode,
        setShouldShowStatusBarLoading,
        lastSearchType,
        setLastSearchType,
    } = useSearchContext();
    const {selectionMode} = useMobileSelectionMode(false);
    const [offset, setOffset] = useState(0);

    const {type, status, sortBy, sortOrder, hash} = queryJSON;

    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const previousReportActions = usePrevious(reportActions);
    const searchResults: OnyxEntry<SearchResults> = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResults;
    const shouldShowYear = shouldShowYearUtil(searchResults?.data as TransactionListItemType[] | ReportListItemType[] | SearchResults['data']);
    const shouldShowSorting = !Array.isArray(status) && sortableSearchStatuses.includes(status);
    const {windowHeight} = useWindowDimensions();

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            setLastNonEmptySearchResults(currentSearchResults);
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    const canSelectMultiple = isSmallScreenWidth ? !!selectionMode?.isEnabled : true;

    useEffect(() => {
        clearSelectedTransactions(hash);
        setCurrentSearchHash(hash);
    }, [hash, clearSelectedTransactions, setCurrentSearchHash]);

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
        if (selectedKeys.length > 0 && !selectionMode?.isEnabled) {
            turnOnMobileSelectionMode();
        }
    }, [isSmallScreenWidth, selectedTransactions, selectionMode?.isEnabled]);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        search({queryJSON, offset});
    }, [isOffline, offset, queryJSON]);

    const getItemHeight = useCallback(
        (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
            if (isTransactionListItemType(item) || isReportActionListItemType(item)) {
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

    const getItemHeightMemoized = memoize(getItemHeight, {
        transformKey: ([item]) => {
            // List items are displayed differently on "L"arge and "N"arrow screens so the height will differ
            // in addition the same items might be displayed as part of different Search screens ("Expenses", "All", "Finished")
            const screenSizeHash = isLargeScreenWidth ? 'L' : 'N';
            return `${hash}-${item.keyForList}-${screenSizeHash}`;
        },
    });

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
    const isSearchResultsEmpty = !searchResults?.data || isSearchResultsEmptyUtil(searchResults);
    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    const data = useMemo(() => {
        if (searchResults === undefined) {
            return [];
        }
        return getSections(type, status, searchResults.data, searchResults.search);
    }, [searchResults, status, type]);

    const isSelected = useCallback(
        (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) =>
            status !== CONST.SEARCH.STATUS.EXPENSE.ALL && isReportListItemType(item)
                ? item.transactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)
                : !!item.isSelected,
        [selectedTransactions, status],
    );

    const initialNumToRender = useMemo((): number => {
        if (searchResults?.data) {
            return 5;
        }

        const singleItemHeight = isLargeScreenWidth ? variables.optionRowHeight + listItemPadding : transactionItemMobileHeight + listItemPadding;
        // Calculate available height (screen height minus headers)
        const availableHeight = windowHeight - searchHeaderHeight;

        // Calculate how many items can fit in the visible area plus some buffer
        const visibleItemCount = Math.ceil(availableHeight / singleItemHeight);

        return Math.ceil(visibleItemCount * 1.5);
    }, [isLargeScreenWidth, searchResults?.data, windowHeight]);

    const onSortPress = useCallback(
        (column: SearchColumnType, order: SortOrder) => {
            const newQuery = buildSearchQueryString({...queryJSON, sortBy: column, sortOrder: order});
            navigation.setParams({q: newQuery});
        },
        [navigation, queryJSON],
    );

    const customListHeader = useMemo(() => {
        if (!isLargeScreenWidth || !searchResults?.data) {
            return null;
        }

        return (
            <SearchTableHeader
                data={searchResults?.data}
                metadata={searchResults?.search}
                onSortPress={onSortPress}
                sortOrder={sortOrder}
                sortBy={sortBy}
                shouldShowYear={shouldShowYear}
                shouldShowSorting={shouldShowSorting}
            />
        );
    }, [isLargeScreenWidth, searchResults?.data, searchResults?.search, onSortPress, sortOrder, sortBy, shouldShowYear, shouldShowSorting]);

    const listFooterContent = useMemo(() => {
        if (!shouldShowLoadingMoreItems) {
            return undefined;
        }

        return (
            <SearchRowSkeleton
                shouldAnimate
                fixedNumItems={5}
            />
        );
    }, [shouldShowLoadingMoreItems]);

    useEffect(() => {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowStatusBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowStatusBarLoading, shouldShowLoadingState, type]);

    useEffect(() => {
        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        const selectedTransactionIds = new Set(Object.keys(selectedTransactions));
        let newTransactionList: SelectedTransactions = {};

        if (status === CONST.SEARCH.STATUS.EXPENSE.ALL) {
            newTransactionList = data.reduce((acc, transaction) => {
                if (!Object.hasOwn(transaction, 'transactionID') || !('transactionID' in transaction)) {
                    return acc;
                }

                if (!selectedTransactionIds.has(transaction.transactionID)) {
                    return acc;
                }

                acc[transaction.transactionID] = {
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

                return acc;
            }, {} as SelectedTransactions);
        } else {
            newTransactionList = data.reduce((acc, report) => {
                if (!Object.hasOwn(report, 'transactions') || !('transactions' in report)) {
                    return acc;
                }

                report.transactions.forEach((transaction) => {
                    if (!selectedTransactionIds.has(transaction.transactionID)) {
                        return;
                    }

                    acc[transaction.transactionID] = {
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

                return acc;
            }, {} as SelectedTransactions);
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

    const ListItem = useMemo(() => getListItem(type, status), [type, status]);

    const sortedData = useMemo(() => getSortedSections(type, status, data, sortBy, sortOrder), [data, sortBy, sortOrder, status, type]);
    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const sortedSelectedData = useMemo(
        () =>
            sortedData.map((item) => {
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
            }),
        [canSelectMultiple, isChat, newSearchResultKey, selectedTransactions, sortedData],
    );
    const toggleTransaction = useCallback(
        (item: TransactionListItemType | ReportListItemType | ReportActionListItemType | null) => {
            if (item === null) {
                return;
            }
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
        },
        [data, selectedTransactions, setSelectedTransactions],
    );

    const toggleAllTransactions = useCallback(() => {
        const areItemsOfReportType = status !== CONST.SEARCH.STATUS.EXPENSE.ALL;
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
    }, [clearSelectedTransactions, data, selectedTransactions, setSelectedTransactions, status]);

    const containerStyles = useMemo(() => [styles.pv0, type === CONST.SEARCH.DATA_TYPES.CHAT && !isSmallScreenWidth && styles.pt3], [type, isSmallScreenWidth, styles]);
    const openReport = useCallback(
        (item: TransactionListItemType | ReportListItemType | ReportActionListItemType) => {
            const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORTID;
            let reportID = isTransactionListItemType(item) && (!item.isFromOneTransactionReport || isFromSelfDM) ? item.transactionThreadReportID : item.reportID;

            if (!reportID) {
                return;
            }

            // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionListItemType(item) && reportID === '0' && item.moneyRequestReportActionID) {
                reportID = generateReportID();
                createTransactionThread(hash, item.transactionID, reportID, item.moneyRequestReportActionID);
            }

            const backTo = Navigation.getActiveRoute();

            if (isReportActionListItemType(item)) {
                const reportActionID = item.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        },
        [hash],
    );

    const sectionsData = useMemo(() => [{data: sortedSelectedData, isDisabled: false}], [sortedSelectedData]);

    const shouldShowEmptyState = !isDataLoaded || data.length === 0;

    const fetchMoreResults = useCallback(() => {
        if (!searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        setOffset(offset + CONST.SEARCH.RESULTS_PAGE_SIZE);
    }, [offset, searchResults?.search?.hasMoreResults, shouldShowLoadingMoreItems, shouldShowLoadingState]);

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
    if (shouldShowEmptyState) {
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <EmptySearchView
                    type={type}
                    hasResults={searchResults.search.hasResults}
                />
            </View>
        );
    }
    const DEFAULT_ITEM_HEIGHT = shouldUseNarrowLayout ? 72 : 112;

    return (
        <SelectionListWithModal<ReportListItemType | TransactionListItemType | ReportActionListItemType>
            ref={handleSelectionListScroll(sortedSelectedData)}
            sections={sectionsData}
            turnOnSelectionModeOnLongPress={type !== CONST.SEARCH.DATA_TYPES.CHAT}
            onTurnOnSelectionMode={toggleTransaction}
            onCheckboxPress={toggleTransaction}
            onSelectAll={toggleAllTransactions}
            customListHeader={customListHeader}
            isSelected={isSelected}
            shouldAutoTurnOff={false}
            onScroll={onSearchListScroll}
            onContentSizeChange={onContentSizeChange}
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
            updateCellsBatchingPeriod={50}
            ListItem={ListItem}
            onSelectRow={openReport}
            getItemHeight={getItemHeightMemoized}
            shouldSingleExecuteRowSelect
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            shouldPreventDefault={false}
            listHeaderWrapperStyle={[styles.ph8, styles.pt3]}
            containerStyle={containerStyles}
            showScrollIndicator={false}
            onEndReachedThreshold={0.75}
            onEndReached={fetchMoreResults}
            listFooterContent={listFooterContent}
            contentContainerStyle={[contentContainerStyle, styles.pb3]}
            scrollEventThrottle={1}
            shouldKeepFocusedItemAtTopOfViewableArea={type === CONST.SEARCH.DATA_TYPES.CHAT}
            isScreenFocused={isSearchScreenFocused}
            initialNumToRender={initialNumToRender}
            maxToRenderPerBatch={initialNumToRender * 4}
            defaultItemHeight={DEFAULT_ITEM_HEIGHT}
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
