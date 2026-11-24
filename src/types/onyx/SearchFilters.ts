import type {SearchKey} from '@libs/SearchKeyUtils';

import type {InsightsExclusionsSearchKey, InsightsSearchKey} from './InsightsDashboard';

/** Filter criteria for a specific search key. */
type SearchFilter = {
    /** Timestamp when the filter was created or updated. */
    timestamp: string;
    /** Query used for the filter. */
    query: string;
};

/**
 * Collection of search filters keyed by search key, by Insights dashboard for the Insights page's page-level controls,
 * or by Insights graph for the items excluded from it, whose query is a JSON array of item keys.
 */
type SearchFilters = Partial<Record<SearchKey | InsightsSearchKey | InsightsExclusionsSearchKey, string | SearchFilter>>;

export default SearchFilters;
