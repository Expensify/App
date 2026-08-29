type OpenSearchTagFiltersPageParams = {
    /** Search query to filter tags */
    searchQuery?: string;

    /** Cursor for pagination */
    cursor?: string;

    /** Maximum number of tags to return per page */
    limit?: number;
};

export default OpenSearchTagFiltersPageParams;
