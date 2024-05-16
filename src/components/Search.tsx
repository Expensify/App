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
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import SearchTableHeader from './SelectionList/SearchTableHeader';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

type SearchProps = {
    query: string;
    policyIDs?: string;
};

function Search({query, policyIDs}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query, policyIDs);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search(hash, query, policyIDs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, isOffline]);

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

    const type = SearchUtils.getSearchType(searchResults?.search);

    if (type === undefined) {
        Log.alert('[Search] Undefined search type');
        return null;
    }

    const ListItem = SearchUtils.getListItem(type);

    const data = SearchUtils.getSections(
        {
            ...searchResults?.data,
            report_5985708612548179: {
                reportID: 5985708612548179,
                reportName: 'name',
                total: 1000,
                currency: 'USD',
                action: 'pay',
            },
        } ?? {},
        type,
    );

    return (
        <SelectionList
            customListHeader={<SearchTableHeader data={searchResults?.data} />}
            ListItem={ListItem}
            sections={[{data, isDisabled: false}]}
            onSelectRow={(item) => {
                if (!item?.transactionThreadReportID) {
                    return;
                }

                openReport(item.transactionThreadReportID);
            }}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
            containerStyle={[styles.pv0]}
            showScrollIndicator={false}
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
