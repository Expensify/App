import React, {useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import EmptySearchView from '@pages/Search/EmptySearchView';
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchReport, SearchTransaction} from '@src/types/onyx/SearchResults';
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
    const [selectedItems, setSelectedItems] = useState<Array<SearchTransaction | SearchReport>>([]);
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useWindowDimensions();
    useCustomBackHandler();

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

    const toggleListItem = (listItem: TransactionListItemType | ReportListItemType) => {
        // @TODO: Selecting checkboxes will be handled in a separate PR
        if (isReportListItemType(listItem)) {
            Log.info(listItem?.reportID?.toString() ?? '');
            return;
        }

        Log.info(listItem.transactionID);
    };

    const ListItem = SearchUtils.getListItem(type);

    const data = SearchUtils.getSections(
        {
            ...searchResults?.data,
            // @TODO: Remove this comment when report items are returned from the API, uncomment it to test whether ReportListItem is displayed properly.
            // report_0: {
            //     reportID: 0,
            //     reportName: 'Alice’s Apples owes $110.00',
            //     total: 1000,
            //     currency: 'USD',
            //     action: 'pay',
            // },
        } ?? {},
        type,
    );

    const toggleAllItems = () => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems([...data]);
        }
    };

    return (
        <SelectionList
            canSelectMultiple={isLargeScreenWidth}
            onSelectAll={toggleAllItems}
            onCheckboxPress={toggleListItem}
            customListHeader={<SearchTableHeader data={searchResults?.data} />}
            ListItem={ListItem}
            sections={[{data, isDisabled: false}]}
            onSelectRow={(item) => {
                const reportID = isReportListItemType(item) ? item.reportID : item.transactionThreadReportID;

                openReport(reportID);
            }}
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
