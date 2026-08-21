import type {SearchKey} from '@libs/SearchUIUtils';

/** Filter criteria for a specific search key. */
type SearchFilter = {
    /** Timestamp when the filter was created or updated. */
    timestamp: string;
    /** Query used for the filter. */
    query: string;
};

/** Collection of search filters keyed by search key. */
type SearchFilters = Record<SearchKey, string | SearchFilter>;

export default SearchFilters;
