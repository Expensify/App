import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import lodashMemoize from 'lodash/memoize';
import React, {useCallback, useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import SearchTableHeader from '@components/SelectionList/SearchTableHeader';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
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
import type {SearchDataTypes, SearchQuery} from '@src/types/onyx/SearchResults';
import {useSearchContext} from './SearchContext';
import SearchListWithHeader from './SearchListWithHeader';
import SearchPageHeader from './SearchPageHeader';
import type {SearchColumnType, SortOrder} from './types';

type SearchProps = {
    query: SearchQuery;
    policyIDs?: string;
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
    isMobileSelectionModeActive?: boolean;
    setIsMobileSelectionModeActive?: (isMobileSelectionModeActive: boolean) => void;
};

const sortableSearchTabs: SearchQuery[] = [CONST.SEARCH.TAB.ALL];
const transactionItemMobileHeight = 100;
const reportItemTransactionHeight = 52;
const listItemPadding = 12; // this is equivalent to 'mb3' on every transaction/report list item
const searchHeaderHeight = 54;
function Search({query, policyIDs, sortBy, sortOrder, isMobileSelectionModeActive, setIsMobileSelectionModeActive}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {isLargeScreenWidth, isSmallScreenWidth} = useWindowDimensions();
    const navigation = useNavigation<StackNavigationProp<AuthScreensParamList>>();
    const lastSearchResultsRef = useRef<OnyxEntry<SearchResults>>();
    const {setCurrentSearchHash} = useSearchContext();

    const hash = SearchUtils.getQueryHash(query, policyIDs, sortBy, sortOrder);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    const getItemHeight = useCallback(
        (item: TransactionListItemType | ReportListItemType) => {
            if (SearchUtils.isTransactionListItemType(item)) {
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

    const getItemHeightMemoized = lodashMemoize(
        (item: TransactionListItemType | ReportListItemType) => getItemHeight(item),
        (item) => {
            // List items are displayed differently on "L"arge and "N"arrow screens so the height will differ
            // in addition the same items might be displayed as part of different Search screens ("Expenses", "All", "Finished")
            const screenSizeHash = isLargeScreenWidth ? 'L' : 'N';
            return `${hash}-${item.keyForList}-${screenSizeHash}`;
        },
    );

    // save last non-empty search results to avoid ugly flash of loading screen when hash changes and onyx returns empty data
    if (currentSearchResults?.data && currentSearchResults !== lastSearchResultsRef.current) {
        lastSearchResultsRef.current = currentSearchResults;
    }

    const searchResults = currentSearchResults?.data ? currentSearchResults : lastSearchResultsRef.current;

    useEffect(() => {
        if (isOffline) {
            return;
        }

        setCurrentSearchHash(hash);
        SearchActions.search({hash, query, policyIDs, offset: 0, sortBy, sortOrder});
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [hash, isOffline]);

    const isDataLoaded = searchResults?.data !== undefined;
    const shouldShowLoadingState = !isOffline && !isDataLoaded;
    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;

    if (shouldShowLoadingState) {
        return (
            <>
                <SearchPageHeader
                    query={query}
                    hash={hash}
                />
                <SearchRowSkeleton shouldAnimate />
            </>
        );
    }

    const shouldShowEmptyState = !isDataLoaded || SearchUtils.isSearchResultsEmpty(searchResults);

    if (shouldShowEmptyState) {
        return (
            <>
                <SearchPageHeader
                    query={query}
                    hash={hash}
                />
                <EmptySearchView />
            </>
        );
    }

    const openReport = (item: TransactionListItemType | ReportListItemType) => {
        let reportID = SearchUtils.isTransactionListItemType(item) ? item.transactionThreadReportID : item.reportID;

        if (!reportID) {
            return;
        }

        // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
        if (SearchUtils.isTransactionListItemType(item) && reportID === '0' && item.moneyRequestReportActionID) {
            reportID = ReportUtils.generateReportID();
            SearchActions.createTransactionThread(hash, item.transactionID, reportID, item.moneyRequestReportActionID);
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(query, reportID));
    };

    const fetchMoreResults = () => {
        if (!searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        const currentOffset = searchResults?.search?.offset ?? 0;
        SearchActions.search({hash, query, offset: currentOffset + CONST.SEARCH.RESULTS_PAGE_SIZE, sortBy, sortOrder});
    };

    const type = SearchUtils.getSearchType(searchResults?.search);

    if (type === undefined) {
        Log.alert('[Search] Undefined search type');
        return null;
    }

    const ListItem = SearchUtils.getListItem(type);

    const data = SearchUtils.getSections(searchResults?.data ?? {}, searchResults?.search ?? {}, type);
    const sortedData = SearchUtils.getSortedSections(type, data, sortBy, sortOrder);

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        navigation.setParams({
            sortBy: column,
            sortOrder: order,
        });
    };

    const isSortingAllowed = sortableSearchTabs.includes(query);

    const shouldShowYear = SearchUtils.shouldShowYear(searchResults?.data);

    const canSelectMultiple = isSmallScreenWidth ? isMobileSelectionModeActive : true;

    return (
        <SearchListWithHeader
            query={query}
            hash={hash}
            data={sortedData}
            searchType={searchResults?.search?.type as SearchDataTypes}
            customListHeader={
                !isLargeScreenWidth ? null : (
                    <SearchTableHeader
                        data={searchResults?.data}
                        metadata={searchResults?.search}
                        onSortPress={onSortPress}
                        sortOrder={sortOrder}
                        isSortingAllowed={isSortingAllowed}
                        sortBy={sortBy}
                        shouldShowYear={shouldShowYear}
                    />
                )
            }
            canSelectMultiple={canSelectMultiple}
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
            shouldDebounceRowSelect
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph8, styles.pv3, styles.pb5]}
            containerStyle={[styles.pv0]}
            showScrollIndicator={false}
            onEndReachedThreshold={0.75}
            onEndReached={fetchMoreResults}
            setIsMobileSelectionModeActive={setIsMobileSelectionModeActive}
            isMobileSelectionModeActive={isMobileSelectionModeActive}
            listFooterContent={
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
