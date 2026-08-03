/** Pagination state of the workspace rooms page for a single policy */
type PolicyRoomsMetadata = {
    /** Whether the first page of rooms has finished loading at least once */
    isLoaded?: boolean;

    /** Whether a page of rooms is currently being fetched */
    isLoading?: boolean;

    /** The page that is currently being fetched, or was fetched last */
    pageNumber?: number;

    /** Whether the backend has more rooms available after the page it just returned */
    hasMoreResults?: boolean;
};

export default PolicyRoomsMetadata;
