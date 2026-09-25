/**
 * Pagination state for tag filter search results.
 *
 * Stored separately from the tag data so pagination survives component remounts
 * without persisting to disk (RAM-only).
 */
type SearchTagFiltersPaginationState = {
    /** Whether there are more pages to load */
    hasMore: boolean;

    /** Cursor for fetching the next page */
    nextCursor: string;

    /** The search query that produced this pagination state */
    searchQuery: string;
};

export default SearchTagFiltersPaginationState;
