type OpenSearchTagFiltersPageParams = {
    /** Search query to filter tags */
    searchQuery?: string;

    /** Cursor for pagination */
    cursor?: string;

    /** Maximum number of tags to return per page */
    limit?: number;

    /** Comma-separated list of policy IDs to scope the tag search to specific workspaces */
    policyIDs?: string;

    /** Whether the request can be aborted when superseded by a newer search */
    canCancel?: boolean;
};

export default OpenSearchTagFiltersPageParams;
