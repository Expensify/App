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
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import CONST from '@src/CONST';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/SearchTableHeader';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

type SearchProps = {
    query: string;
    offset: number;
};

function Search({query, offset}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search(query, offset);
    }, [query, offset, isOffline]);

    const isLoading = (!isOffline && isLoadingOnyxValue(searchResultsMeta)) || searchResults?.data === undefined;
    const shouldShowEmptyState = !isLoading && isEmptyObject(searchResults?.data);

    if (isLoading) {
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
        if (!searchResults?.search?.hasMoreResults) {
            return;
        }

        const nextOffset = offset + CONST.SEARCH_RESULTS_PAGE_SIZE;
        Navigation.navigate(ROUTES.SEARCH.getRoute(query, nextOffset));
    }

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
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
