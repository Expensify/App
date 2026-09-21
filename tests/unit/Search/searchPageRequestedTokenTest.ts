import {consumePageRequestedSearch, markPageRequestedSearch} from '@libs/actions/Search';

const QUERY_HASH = 1234;
const OTHER_QUERY_HASH = 5678;

// The Search page requests a query's first page while the loading skeleton is up, and the Search
// component mounts only after that request settles - too late for the in-flight dedupe to catch it.
// This token is the only trace of the page's request left by then, so its lifetime is load-bearing.
describe('page-requested search token', () => {
    it('reports the query the page most recently requested', () => {
        // Given the page requested a query
        markPageRequestedSearch(QUERY_HASH, false);

        // When the component that mounts afterwards reads the token for that same query
        // Then it learns the page already owns this request
        expect(consumePageRequestedSearch(QUERY_HASH, false)).toBe(true);
    });

    it('reads once, so a later refresh of the same query is not suppressed', () => {
        // Given the page requested a query and the mount already consumed the token
        markPageRequestedSearch(QUERY_HASH, false);
        consumePageRequestedSearch(QUERY_HASH, false);

        // When the same query is read again, as a revisit refresh would
        // Then the token is gone and the refresh is free to fire
        expect(consumePageRequestedSearch(QUERY_HASH, false)).toBe(false);
    });

    it('ignores a query the page did not request', () => {
        // Given the page requested one query
        markPageRequestedSearch(QUERY_HASH, false);

        // When a different query reads the token
        // Then it gets nothing, so its own request still goes out
        expect(consumePageRequestedSearch(OTHER_QUERY_HASH, false)).toBe(false);
    });

    it('drops an abandoned token when the query changes', () => {
        // Given the page requested a query and then the user changed the filter before it was read
        markPageRequestedSearch(QUERY_HASH, false);
        markPageRequestedSearch(OTHER_QUERY_HASH, false);

        // When the abandoned query is read later
        // Then the stale token cannot suppress anything, because only one slot is kept
        expect(consumePageRequestedSearch(QUERY_HASH, false)).toBe(false);
        expect(consumePageRequestedSearch(OTHER_QUERY_HASH, false)).toBe(true);
    });

    it('does not cover a caller that needs totals the page did not request', () => {
        // Given the page requested a query without totals
        markPageRequestedSearch(QUERY_HASH, false);

        // When a caller that needs totals reads the token
        // Then it is not covered and must still request them itself
        expect(consumePageRequestedSearch(QUERY_HASH, true)).toBe(false);
    });

    it('covers a caller that does not need the totals the page already requested', () => {
        // Given the page requested a query with totals
        markPageRequestedSearch(QUERY_HASH, true);

        // When a caller that does not need totals reads the token
        // Then it is covered, because the page's request is a superset of what it wants
        expect(consumePageRequestedSearch(QUERY_HASH, false)).toBe(true);
    });
});
