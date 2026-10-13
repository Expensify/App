import {useSearchResultsContext} from '@components/Search/SearchContext';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

/**
 * The data type of the snapshot that is actually on screen, which is not always the type the query asks
 * for: on a main to-do search the provider swaps the snapshot out for live Onyx data, so the snapshot's
 * own `search.type` is not authoritative and the type is forced to EXPENSE_REPORT.
 *
 * Anything that derives columns from snapshot data needs this rather than the query or the
 * advanced-filters form type, so that the type and the data it is paired with always agree.
 */
function useSearchDataType(searchResults: SearchResults | undefined): SearchDataTypes | undefined {
    const {shouldUseLiveData} = useSearchResultsContext();

    return shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type;
}

export default useSearchDataType;
