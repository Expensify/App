import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/SearchTableHeader';
import type {ReportListItemType, TransactionListItemType} from './SelectionList/types';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

type SearchProps = {
    query: string;
    policyIDs?: string;
};

function isReportListItemType(item: TransactionListItemType | ReportListItemType): item is ReportListItemType {
    const reportListItem = item as ReportListItemType;
    return reportListItem.transactions !== undefined;
}

function Search({query, policyIDs}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const hash = SearchUtils.getQueryHash(query, policyIDs);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search(hash, query, 0, policyIDs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, isOffline]);

    const isLoadingInitialItems = (!isOffline && isLoadingOnyxValue(searchResultsMeta)) || searchResults?.data === undefined;
    const isLoadingMoreItems = !isLoadingInitialItems && searchResults?.search?.isLoading;
    const shouldShowEmptyState = !isLoadingInitialItems && isEmptyObject(searchResults?.data);

    if (isLoadingInitialItems) {
        return <TableListItemSkeleton shouldAnimate />;
    }

    if (shouldShowEmptyState) {
        return <EmptySearchView />;
    }

    const openReport = (reportID?: string) => {
        if (!reportID) {
            return;
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(query, reportID));
    };

    const fetchMoreResults = () => {
        if (!searchResults?.search?.hasMoreResults || isLoadingInitialItems || isLoadingMoreItems) {
            return;
        }
        const currentOffset = searchResults?.search?.offset ?? 0;
        SearchActions.search(hash, query, currentOffset + CONST.SEARCH_RESULTS_PAGE_SIZE);
    };

    const type = SearchUtils.getSearchType(searchResults?.search);

    if (type === undefined) {
        Log.alert('[Search] Undefined search type');
        return null;
    }

    const ListItem = SearchUtils.getListItem(type);

    const data = SearchUtils.getSections(searchResults?.data ?? {}, type);

    return (
        <SelectionList<ReportListItemType | TransactionListItemType>
            customListHeader={<SearchTableHeader data={searchResults?.data} />}
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
            sections={[{data, isDisabled: false}]}
            onSelectRow={(item) => {
                const reportID = isReportListItemType(item) ? item.reportID : item.transactionThreadReportID;

                openReport(reportID);
            }}
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
