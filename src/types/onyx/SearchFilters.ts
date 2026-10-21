import type {SearchKey} from '@libs/SearchKeyUtils';

import type {InsightsSearchKey} from './InsightsDashboard';

/** Filter criteria for a specific search key. */
type SearchFilter = {
    /** Timestamp when the filter was created or updated. */
    timestamp: string;
    /** Query used for the filter. */
    query: string;
    /** Insights only: whether the Spend over time chart accumulates spend across the range instead of plotting each period's own total. Kept off the query so toggling it never re-runs the backend search. */
    runningTotal?: boolean;
};

/** Collection of search filters keyed by search key or by Insights dashboard for the Insights page's page-level controls. */
type SearchFilters = Partial<Record<SearchKey | InsightsSearchKey, string | SearchFilter>>;

export default SearchFilters;
