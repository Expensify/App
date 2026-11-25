type OpenSearchUserFiltersPageResponse = {
    /** Whether more pages of user filter results are available */
    hasMore?: boolean;

    /** Pagination cursor to pass for fetching the next page of user filters */
    nextCursor?: string;
};

export default OpenSearchUserFiltersPageResponse;
