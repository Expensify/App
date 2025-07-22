import type {SearchQueryJSON} from '@components/Search/types';

/**
 * Represents the parameters from the previous search invocation.
 * This is used to persist search arguments between navigations within reports,
 * and allows loading more search results as the user continues navigating.
 */
type LastSearchParams = {
    /**
     * The number of results returned in the previous search.
     */
    previousLengthOfResults?: number;
    /**
     * Indicates whether there are more results available beyond the last search.
     */
    hasMoreResults?: boolean;

    /**
     * The full query JSON object that was used in the last search.
     */
    queryJSON: SearchQueryJSON;
    /**
     * The current offset used in pagination for fetching the previous set of results.
     */
    offset?: number;
};

export default LastSearchParams;
