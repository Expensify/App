import type {SearchQueryString} from '@components/Search/types';

/**
 * Records which search query was produced by refining the filters of the list already on screen.
 *
 * The results area holds the previous query's results through its swap animation so a filter tweak doesn't flash a
 * skeleton. That only reads correctly for a refinement: navigating to a sidebar item or a saved search asks for a
 * different search, where holding the old results would show rows unrelated to the destination. A query alone can't
 * tell the two apart — both arrive as a new `q` on the same screen — so the filter path records its query here.
 *
 * Only the most recent query is kept, and opening a search clears it: an unknown query is treated as a different
 * search, so a missed mark costs a skeleton rather than showing stale results.
 */
let refinedQuery: SearchQueryString | undefined;

function markQueryAsRefinement(query: SearchQueryString) {
    refinedQuery = query;
}

function clearQueryRefinement() {
    refinedQuery = undefined;
}

function isQueryARefinement(query: SearchQueryString | undefined) {
    return !!query && refinedQuery === query;
}

export {markQueryAsRefinement, clearQueryRefinement, isQueryARefinement};
