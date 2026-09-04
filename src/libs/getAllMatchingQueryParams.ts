import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import {isEmptyObject} from '@src/types/utils/EmptyObject';

import Log from './Log';
import {serializeQueryJSONForBackend} from './SearchQueryUtils';

type AllMatchingQueryParams = {jsonQuery?: string; hash?: number};

/**
 * The backend resolves an "all matching" move from the search query, so it needs the query and its hash together.
 * Without them only the loaded page moves while the UI claims every match was selected.
 *
 * Returns an empty object (so callers fall back to the explicit transaction list) when the query can't safely
 * represent the selection: not an all-matching selection, some rows were unchecked (a query can't express
 * exclusions), or the query is unavailable.
 */
function getAllMatchingQueryParams(
    areAllMatchingItemsSelected: boolean,
    excludedTransactions: SelectedTransactions | undefined,
    currentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined,
): AllMatchingQueryParams {
    // The query can't express unchecked rows, so sending it would move them back in
    if (!areAllMatchingItemsSelected || !isEmptyObject(excludedTransactions ?? {})) {
        return {};
    }
    if (!currentSearchQueryJSON) {
        Log.warn('[getAllMatchingQueryParams] All matching expenses are selected but the search query is unavailable; only the loaded expenses will be moved.');
        return {};
    }
    return {jsonQuery: serializeQueryJSONForBackend(currentSearchQueryJSON), hash: currentSearchQueryJSON.hash};
}

export default getAllMatchingQueryParams;
