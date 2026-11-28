/**
 * Session-scoped lookup state for search user filters.
 *
 * Stored in a RAM-only Onyx collection per workspace scope so pagination and
 * workspace-scoped logins survive component remounts without persisting to disk.
 */
type SearchUserFiltersState = {
    /** Whether at least the first page for the empty search query has loaded */
    hasLoadedBase?: boolean;

    /** Whether more pages are available for the empty search query */
    hasMore?: boolean;

    /** Cursor for fetching the next page of the empty search query */
    nextCursor?: string;

    /** Workspace-scoped logins returned by the server for this workspace scope */
    scopedLogins?: string[];
};

export default SearchUserFiltersState;
