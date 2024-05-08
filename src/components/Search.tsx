import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import EmptySearchView from '@pages/Search/EmptySearchView';
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/SearchTableHeader';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

type SearchProps = {
    query: string;
};

function Search({query}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search(query);
    }, [query, isOffline]);

    const isLoadingInitialItems = (!isOffline && isLoadingOnyxValue(searchResultsMeta)) || searchResults?.data === undefined;
    const isLoadingMoreItems = searchResults?.search?.isLoading ?? false;
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
        SearchActions.search(query, currentOffset + CONST.SEARCH_RESULTS_PAGE_SIZE);
    };

    const ListItem = SearchUtils.getListItem();
    const data = SearchUtils.getSections(searchResults?.data ?? {});
    const shouldShowMerchant = SearchUtils.getShouldShowMerchant(searchResults?.data ?? {});

    return (
        <SelectionList
            customListHeader={<SearchTableHeader shouldShowMerchant={shouldShowMerchant} />}
            ListItem={ListItem}
            sections={[{data, isDisabled: false}]}
            onSelectRow={(item) => {
                openReport(item.transactionThreadReportID);
            }}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
            containerStyle={[styles.pv0]}
            onEndReachedThreshold={0.75}
            onEndReached={fetchMoreResults}
            listFooterContent={
                isLoadingMoreItems ? (
                    <TableListItemSkeleton
                        shouldAnimate
                        fixedNumItems={10}
                    />
                ) : undefined
            }
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
