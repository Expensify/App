import type {SearchQueryString} from '@components/Search/types';

/**
 * Only a filter refinement may hold the previous results, and a query alone can't prove one — a sidebar item and a
 * filter tweak both arrive as a new `q`. An unknown query counts as a different search, so a missed mark costs a skeleton.
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
