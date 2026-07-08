import {useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import {getValidGroupBy, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

import useOptimisticSearchTracking from './useOptimisticSearchTracking';

type OptimisticTrackingParams = Parameters<typeof useOptimisticSearchTracking>[0];

type UseSearchShellParams = {
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot, owned by the ancestor and passed in. */
    searchResults: SearchResults | undefined;
    /** Full TRANSACTION + REPORT_ACTIONS collections used by the optimistic-row tracking. Threaded in from
     *  the parent (which already subscribes to them for the highlight hook) so we don't open duplicate
     *  full-collection reads. */
    transactions: OptimisticTrackingParams['transactions'];
    reportActions: OptimisticTrackingParams['reportActions'];
};

/**
 * Type-agnostic core of the Search data layer.
 *
 * Owns the two things that must exist exactly once per Search screen and that a per-type section builder
 * cannot reconstruct on its own:
 *   1. the stateful optimistic-row tracking (refs, timeouts, the augmented snapshot), and
 *   2. the single `shouldComputeSections` gate derived from it.
 *
 * It intentionally subscribes to NOTHING type-specific: locale/account/network are cheap context reads the
 * active section builder makes itself, and every heavy per-type Onyx subscription lives in the per-type
 * leaf so inactive types never open it. That is what lets each search type pay only for the data it needs.
 */
function useSearchShell({queryJSON, searchResults, transactions, reportActions}: UseSearchShellParams): SearchShell {
    const {type, groupBy} = queryJSON;
    const {shouldUseLiveData} = useSearchResultsContext();

    // Inject an optimistically-created transaction the server has not indexed yet so its row mounts
    // immediately.
    const tracking = useOptimisticSearchTracking({searchResults, queryJSON, transactions, reportActions});
    const optimisticTransactionID = tracking.trackingState.optimisticWatchKey?.toString().replace(ONYXKEYS.COLLECTION.TRANSACTION, '');

    const validGroupBy = getValidGroupBy(groupBy);
    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;

    // There's a race condition in Onyx which makes it return data from the previous Search, so in
    // addition to checking that the data is loaded we also check that the snapshot matches the query.
    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);

    // The one gate: skip the heavy projection while deferring, before data is loaded, before the snapshot
    // is present, or for the invalid group-by-on-chat/task combo. Every per-type builder honors it.
    const shouldComputeSections =
        !tracking.shouldDeferHeavySearchWork && searchResults !== undefined && isDataLoaded && !!tracking.searchDataWithOptimisticTransaction && !(validGroupBy && (isChat || isTask));

    return {
        ...tracking,
        optimisticTransactionID,
        shouldComputeSections,
    };
}

type SearchShell = ReturnType<typeof useOptimisticSearchTracking> & {
    /** Transaction id of the tracked optimistic row, threaded into the transaction builder. */
    optimisticTransactionID: string | undefined;
    /** The one gate: is it safe/worth running the heavy build+sort this render? */
    shouldComputeSections: boolean;
};

export default useSearchShell;
export type {SearchShell, UseSearchShellParams};
