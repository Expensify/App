import {useState} from 'react';

type UsePaginatedDataConfig = {
    /** When this value changes, pagination resets to the first page. */
    resetKey?: string;

    /** When true, returns `data` as-is with `hasMore: false` and a no-op `loadMore`. */
    skipPagination?: boolean;
};

/**
 * Client-side bounded-slice pagination.
 *
 * Returns the first `pageSize * currentPage` items of `data`, plus `loadMore` to advance a page and
 * `hasMore` to indicate whether more items are available. `currentPage` is reset to 1 whenever
 * `resetKey` changes, so callers can tie the page back to a logical context (e.g. a search query).
 */
function usePaginatedData<T>(
    data: T[],
    pageSize: number,
    {resetKey = '', skipPagination = false}: UsePaginatedDataConfig = {},
): {
    paginatedData: T[];
    loadMore: () => void;
    hasMore: boolean;
} {
    const [prevResetKey, setPrevResetKey] = useState(resetKey);
    const [currentPage, setCurrentPage] = useState(1);

    if (resetKey !== prevResetKey) {
        setPrevResetKey(resetKey);
        setCurrentPage(1);
    }

    if (skipPagination) {
        return {paginatedData: data, loadMore: () => {}, hasMore: false};
    }

    if (pageSize < 1) {
        return {paginatedData: [], loadMore: () => {}, hasMore: false};
    }

    const limit = pageSize * currentPage;
    const paginatedData = data.slice(0, limit);
    const hasMore = data.length > limit;

    const loadMore = () => {
        if (!hasMore) {
            return;
        }
        setCurrentPage((prev) => prev + 1);
    };

    return {paginatedData, loadMore, hasMore};
}

export default usePaginatedData;
