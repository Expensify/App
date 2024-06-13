import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import * as ReportUtils from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import type {SearchColumnType, SortOrder} from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/SearchTableHeader';
import type {ReportListItemType, TransactionListItemType} from './SelectionList/types';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

type SearchProps = {
    query: SearchQuery;
    policyIDs?: string;
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
};

const sortableSearchTabs: SearchQuery[] = [CONST.TAB_SEARCH.ALL];

function Search({query, policyIDs, sortBy, sortOrder}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const navigation = useNavigation<StackNavigationProp<CentralPaneNavigatorParamList>>();
    const lastSearchResultsRef = useRef<OnyxEntry<SearchResults>>();

    const hash = SearchUtils.getQueryHash(query, policyIDs, sortBy, sortOrder);
    const [currentSearchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    // save last non-empty search results to avoid ugly flash of loading screen when hash changes and onyx returns empty data
    if (currentSearchResults?.data && currentSearchResults !== lastSearchResultsRef.current) {
        lastSearchResultsRef.current = currentSearchResults;
    }

    const searchResults = currentSearchResults?.data ? currentSearchResults : lastSearchResultsRef.current;

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search({hash, query, policyIDs, offset: 0, sortBy, sortOrder});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, isOffline]);

    const isLoadingItems = (!isOffline && isLoadingOnyxValue(searchResultsMeta)) || searchResults?.data === undefined;
    const isLoadingMoreItems = !isLoadingItems && searchResults?.search?.isLoading;
    const shouldShowEmptyState = !isLoadingItems && isEmptyObject(searchResults?.data);

    if (isLoadingItems) {
        return <TableListItemSkeleton shouldAnimate />;
    }

    if (shouldShowEmptyState) {
        return <EmptySearchView />;
    }

    const openReport = (item: TransactionListItemType | ReportListItemType) => {
        let reportID = isTransactionListItemType(item) ? item.transactionThreadReportID : item.reportID;

        if (!reportID) {
            return;
        }

        // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
        if (isTransactionListItemType(item) && reportID === '0' && item.moneyRequestReportActionID) {
            reportID = ReportUtils.generateReportID();
            SearchActions.createTransactionThread(hash, item.transactionID, reportID, item.moneyRequestReportActionID);
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(query, reportID));
    };

    const fetchMoreResults = () => {
        if (!searchResults?.search?.hasMoreResults || isLoadingItems || isLoadingMoreItems) {
            return;
        }
        const currentOffset = searchResults?.search?.offset ?? 0;
        SearchActions.search({hash, query, offset: currentOffset + CONST.SEARCH_RESULTS_PAGE_SIZE, sortBy, sortOrder});
    };

    const type = SearchUtils.getSearchType(searchResults?.search);

    if (type === undefined) {
        Log.alert('[Search] Undefined search type');
        return null;
    }

    const ListItem = SearchUtils.getListItem(type);

    const data = SearchUtils.getSections(searchResults?.data ?? {}, type);
    const sortedData = SearchUtils.getSortedSections(type, data, sortBy, sortOrder);

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        navigation.setParams({
            sortBy: column,
            sortOrder: order,
        });
    };

    const isSortingAllowed = sortableSearchTabs.includes(query);

    const shouldShowYear = SearchUtils.shouldShowYear(searchResults?.data);

    return (
        <SelectionList<ReportListItemType | TransactionListItemType>
            customListHeader={
                <SearchTableHeader
                    data={searchResults?.data}
                    onSortPress={onSortPress}
                    sortOrder={sortOrder}
                    isSortingAllowed={isSortingAllowed}
                    sortBy={sortBy}
                    shouldShowYear={shouldShowYear}
                />
            }
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
            sections={[{data: sortedData, isDisabled: false}]}
            onSelectRow={(item) => openReport(item)}
            shouldDebounceRowSelect
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
            containerStyle={[styles.pv0]}
            showScrollIndicator={false}
            onEndReachedThreshold={0.75}
            onEndReached={fetchMoreResults}
            listFooterContent={
                isLoadingMoreItems ? (
                    <TableListItemSkeleton
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
