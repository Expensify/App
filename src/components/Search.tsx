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

type SearchProps = {
    query: string;
};

function Search({query}: SearchProps) {
    const {isOffline} = useNetwork();
    const hash = SearchUtils.getQueryHash(query);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

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
    return SearchUtils.getSections(searchResults.data).map((item) => (
        <ListItem
            key={item.transactionID}
            item={item}
        />
    ));
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
