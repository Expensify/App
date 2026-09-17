import CONST from '@src/CONST';

import type {SearchKey} from './SearchKeyUtils';

import {setSearchContext} from './actions/Search';
import {navigationRef} from './Navigation/Navigation';
import {getValidLastQuery} from './SearchQueryUtils';

function navigateToCannedSpendSearch(searchKey: SearchKey, searchQuery: string, lastSearchQuery: string | undefined, clearSelectedTransactions: () => void) {
    clearSelectedTransactions();
    setSearchContext(false);
    const query = getValidLastQuery(lastSearchQuery, searchQuery);
    navigationRef.dispatch({
        type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
        payload: {params: {q: query, rawQuery: undefined, searchKey}},
    });
}

export default navigateToCannedSpendSearch;
