import type {SearchTagFilterItem} from '@src/types/onyx';

type OpenSearchTagFiltersPageResponse = {
    /** Whether more pages of tag filter results are available */
    hasMore?: boolean;

    /** Pagination cursor to pass for fetching the next page of tag filters */
    nextCursor?: string;

    /** Slice of tag filter results for this page */
    tags?: SearchTagFilterItem[];
};

export default OpenSearchTagFiltersPageResponse;
