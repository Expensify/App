import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import * as SearchUtils from '@libs/SearchUtils';
import type {SearchColumnType, SortOrder} from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/SearchTableHeader';
import type {TransactionListItemType} from './SelectionList/types';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

const columnNamesToPropertyMap = {
    [CONST.SEARCH_TABLE_COLUMNS.TO]: 'formattedTo' as const,
    [CONST.SEARCH_TABLE_COLUMNS.FROM]: 'formattedFrom' as const,
    [CONST.SEARCH_TABLE_COLUMNS.DATE]: 'date' as const,
    [CONST.SEARCH_TABLE_COLUMNS.TAG]: 'tag' as const,
    [CONST.SEARCH_TABLE_COLUMNS.MERCHANT]: 'merchant' as const,
    [CONST.SEARCH_TABLE_COLUMNS.TOTAL]: 'formattedTotal' as const,
    [CONST.SEARCH_TABLE_COLUMNS.CATEGORY]: 'category' as const,
    [CONST.SEARCH_TABLE_COLUMNS.TYPE]: 'type' as const,
    [CONST.SEARCH_TABLE_COLUMNS.ACTION]: 'action' as const,
    [CONST.SEARCH_TABLE_COLUMNS.DESCRIPTION]: null,
    [CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT]: null,
};

function getSortedData(data: TransactionListItemType[], sortBy?: SearchColumnType, sortOrder?: SortOrder) {
    if (!sortBy || !sortOrder) {
        return data;
    }

    const sortingProp = columnNamesToPropertyMap[sortBy];

    if (!sortingProp) {
        return data;
    }

    return data.sort((a, b) => {
        const aValue = a[sortingProp];
        const bValue = b[sortingProp];

        if (!aValue || !bValue) {
            return 0;
        }

        // We are guaranteed that both a and b will be string or number at the same time
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' ? aValue.toLowerCase().localeCompare(bValue) : bValue.toLowerCase().localeCompare(aValue);
        }

        const aNum = aValue as number;
        const bNum = bValue as number;

        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });
}

type SearchProps = {
    query: SearchQuery;
    policyIDs?: string;
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
};

function Search({query, policyIDs, sortOrder, sortBy}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const navigation = useNavigation<StackNavigationProp<CentralPaneNavigatorParamList>>();

    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query, policyIDs);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search({hash, query, policyIDs, offset: 0, sortBy, sortOrder});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, isOffline, sortBy, sortOrder]);

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
        SearchActions.search({hash, query, offset: currentOffset + CONST.SEARCH_RESULTS_PAGE_SIZE, sortBy, sortOrder});
    };

    const type = SearchUtils.getSearchType(searchResults?.search);

    if (type === undefined) {
        Log.alert('[Search] Undefined search type');
        return null;
    }

    const ListItem = SearchUtils.getListItem(type);
    const data = SearchUtils.getSections(searchResults?.data ?? {}, type);

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        navigation.setParams({
            sortBy: column,
            sortOrder: order,
        });
    };

    const sortedData = getSortedData(data, sortBy, sortOrder);

    return (
        <SelectionList
            customListHeader={
                <SearchTableHeader
                    data={searchResults?.data}
                    onSortPress={onSortPress}
                    sortOrder={sortOrder}
                    sortBy={sortBy}
                />
            }
            ListItem={ListItem}
            sections={[{data: sortedData, isDisabled: false}]}
            onSelectRow={(item) => {
                openReport(item.transactionThreadReportID);
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
