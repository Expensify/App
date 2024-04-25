import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import * as SearchActions from '@libs/actions/Search';
import * as SearchUtils from '@libs/SearchUtils';
import EmptySearchView from '@pages/Search/EmptySearchView';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';

// For testing purposes run this code in browser console to insert fake data:
// query is the param from URL, by default it will be "all"
// Onyx.set(`search_${query}`, {
//             search: {
//                 offset: 0,
//                 type: 'transaction',
//                 hasMoreResults: false,
//             },
//             data: {
//                 transactions_1234: {
//                     receipt: {source: 'http...'},
//                     hasEReceipt: false,
//                     created: '2024-04-11 00:00:00',
//                     amount: 12500,
//                     type: 'cash',
//                     reportID: '1',
//                     transactionThreadReportID: '2',
//                     transactionID: '1234',
//                 },
//                 transactions_5555: {
//                     receipt: {source: 'http...'},
//                     hasEReceipt: false,
//                     created: '2024-04-11 00:00:00',
//                     amount: 12500,
//                     type: 'cash', // not present in live data (data outside of snapshot_)
//                     reportID: '1',
//                     transactionThreadReportID: '2',
//                     transactionID: '5555',
//                 },
//             },
//         })

type SearchProps = {
    query: string;
};

function Search({query}: SearchProps) {
    const {isOffline} = useNetwork();
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SEARCH}${query}`);

    useEffect(() => {
        SearchActions.search(query);
    }, [query]);

    const isLoading = !isOffline && isLoadingOnyxValue(searchResultsMeta);
    const shouldShowEmptyState = isEmptyObject(searchResults);

    if (isLoading) {
        return <TableListItemSkeleton shouldAnimate />;
    }

    if (shouldShowEmptyState) {
        return <EmptySearchView />;
    }

    const ListItem = SearchUtils.getListItem();

    // This will be updated with the proper List component in another PR
    return SearchUtils.getTransactionsSections(searchResults.data).map((item) => (
        <ListItem
            key={item.transactionID}
            item={item}
        />
    ));
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
