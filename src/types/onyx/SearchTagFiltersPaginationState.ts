import type {SearchTagFilterItem} from './PolicyTag';

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

    /** The policy IDs (comma-separated) that this pagination state and cached results belong to */
    policyIDs?: string;

    /** The cached base tags for the empty query ('') */
    baseResults?: SearchTagFilterItem[];

    /** Whether there are more pages of base tags */
    baseHasMore?: boolean;

    /** Cursor for fetching the next page of base tags */
    baseCursor?: string;
};

export default SearchTagFiltersPaginationState;
