import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import {isEmptyObject} from '@src/types/utils/EmptyObject';

import Log from './Log';
import {serializeQueryJSONForBackend} from './SearchQueryUtils';

type AllMatchingQueryParams = {jsonQuery?: string; hash?: number};

/**
 * The backend needs the query and its hash to move every matching expense. Without them only the loaded page moves.
 *
 * @returns The query params, or an empty object when the query can't represent the selection. Callers then fall back
 * to the explicit transaction list.
 */
function getAllMatchingQueryParams(
    areAllMatchingItemsSelected: boolean,
    excludedTransactions: SelectedTransactions | undefined,
    currentSearchQueryJSON: Readonly<SearchQueryJSON> | undefined,
): AllMatchingQueryParams {
    // A query can't express unchecked rows, so sending it would move them back in
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
